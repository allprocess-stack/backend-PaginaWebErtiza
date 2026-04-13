import net from "net";

let tcpClient: net.Socket | null = null;

export const setTcpConnection = (config: any): Promise<net.Socket> => {
    return new Promise((resolve, reject) => {
        if (tcpClient) {
            tcpClient.destroy();
            tcpClient = null;
        }

        const client = new net.Socket();

        client.connect(Number(config.Puerto), config.Ip, () => {
            tcpClient = client;
            resolve(client);
        });

        client.on("error", reject);

        client.on("close", () => {
            tcpClient = null;
        });
    });
};

// NUEVA función para desconectar
export const disconnectTcp = () => {
    if (tcpClient) {
        tcpClient.destroy();
        tcpClient = null;
        return true;
    }
    return false;
};

export const getTcpConnection = () => tcpClient;