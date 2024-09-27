export async function getAddress() {

    let serverAddress;

    await fetch("../../../backend/configs/ip_addrs")
    .then((res) => res.text())
    .then((text) => {
        serverAddress = text;
    })
    .catch((e) => console.error(e));

    return serverAddress;
}
