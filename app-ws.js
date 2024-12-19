const WebSocket = require("ws");

// Posições iniciais
const person1 = {
    id: 1,
    name: "João",
    location: {
        lat: -25.428954, // Centro de Curitiba (próximo à Rua XV)
        lng: -49.271078,
    },
};

const person2 = {
    id: 2,
    name: "Maria",
    location: {
        lat: -25.441105, // Jardim Botânico
        lng: -49.241177,
    },
};

function updateLocation(location) {
    return {
        lat: location.lat + (Math.random() - 0.5) * 0.0004, // Movimento aleatório de aprox. 40 metros
        lng: location.lng + (Math.random() - 0.5) * 0.0004,
    };
}

function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

function onMessage(ws, data) {
    console.log(`onMessage: ${data}`);
    ws.send(`recebido!`);
}

function onConnection(ws, req) {
    ws.on("message", (data) => onMessage(ws, data));
    ws.on("error", (error) => onError(ws, error));
    console.log(`onConnection`);

    const interval = setInterval(() => {
        console.log("Enviando dados...");
        person1.location = updateLocation(person1.location);
        person2.location = updateLocation(person2.location);

        const data = {
            operationId: "tracking_" + "123893838",
            people: [person1, person2],
            tact: {
                location: {
                    lat: -25.43503,
                    lng: -49.256128,
                },
                range: 2,
            },
            markers: [
                {
                    id: "marker_1",
                    location: person1.location,
                    type: "person",
                },
                {
                    id: "marker_2",
                    location: person2.location,
                    type: "person",
                },
            ],
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
        console.log("Dados enviados!");
    }, 1000); // A cada 1 segundos

    ws.on("close", () => {
        clearInterval(interval);
        console.log("Cliente desconectado");
    });
}

module.exports = (server) => {
    const wss = new WebSocket.Server({
        server,
    });

    wss.on("connection", onConnection);

    console.log(`Servidor WebSocket está rodando!`);
    return wss;
};
