$(function () {
        var canvas = document.getElementById('wb');;
        var ctx = canvas.getContext('2d');

        var isDrawing = false;
        ctx.strokeStyle = 'red';

        canvas.onmousedown = function(e) {
                isDrawing = true;
                ctx.moveTo(e.clientX, e.clientY);
                send( {Status: 0,  X: e.clientX, Y: e.clientY } );
        };

        canvas.onmousemove = function(e) {
                if (isDrawing) {
                        ctx.lineTo(e.clientX, e.clientY);
                        ctx.stroke();
                        send( {Status: 1,  X: e.clientX, Y: e.clientY } );
                }
        };
        
        canvas.onmouseup = function() {
                isDrawing = false;
        };

        conn = null;

        if (window["WebSocket"]) {
                conn = new WebSocket("ws://localhost:8080/json");

                conn.onclose = function(evt) {
                        alert('connection closed');
                }

                conn.onmessage = function(evt) {
                        obj = jQuery.parseJSON(evt.data);
                        if (obj.Status == 0) {
                                ctx.moveTo(obj.X, obj.Y);
                        } else if (obj.Status == 1) {
                                ctx.lineTo(obj.X, obj.Y);
                                ctx.stroke();
                        }
                }
        } else {
                alert('your browser does not support web sockets');
        }
});

function send(p) {
        conn.send(JSON.stringify(p));
}
