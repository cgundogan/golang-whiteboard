package main

import (
        "log"
        "net/http"
        "code.google.com/p/go.net/websocket"
)

type Msg struct {
        Status int
        X, Y float64
}

var m map[*websocket.Conn]chan Msg = make(map[*websocket.Conn]chan Msg)

func jsonServer(ws *websocket.Conn) {
        recvChan := make(chan Msg)
        m[ws] = recvChan
        log.Printf("Added: %v\n", m)
        go func() {
             for {
                select {
                case rMsg := <-recvChan:
                        err := websocket.JSON.Send(ws, rMsg)
                        if err != nil {
                                log.Println(err)
                                break
                        }
                        log.Printf("send:%#v\n", rMsg)
                }
             }
        }()
        for {
                var msg Msg
                err := websocket.JSON.Receive(ws, &msg)
                if err != nil {
                        log.Println(err)
                        break
                }
                log.Printf("recv:%#v\n", msg)
                for key, value := range m {
                        if key != ws {
                                value <- msg
                        }
                }
        }
        delete(m, ws)
        log.Printf("After delete: %v\n", m)
}

func main() {
        log.Println("starting server..")
        http.Handle("/json", websocket.Handler(jsonServer))
        http.Handle("/", http.FileServer(http.Dir("assets")))
        log.Fatal(http.ListenAndServe(":8080", nil))
}
