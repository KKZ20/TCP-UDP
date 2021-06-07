class FormData {
    constructor(srcMAC, srcIP, srcPort) {
        this.srcMAC = srcMAC;
        this.srcIP = srcIP;
        this.srcPort = srcPort;
    }
    check() {
        console.log('checking!');
        return [];
    }
}
let Data = '';
export { FormData, Data };