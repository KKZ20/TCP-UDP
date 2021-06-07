/**
 * @author Henry Wong
 * see the end of the code for an example
 */

const UDPHeaderLengthMap = new Map([
  ['SourcePort',      16],
  ['DestinationPort', 16],
  ['Length',          16],
  ['Checksum',        16],
]);

// This UDP Datagram runs on IPv4
class UDPDatagram {
  constructor(addr, port) {
    this.addr = addr;
    this.port = port;
    this.datagram = [];
    this.binHeader = '';
  }

  encapsulateDatagram(srcAddr, srcPort, dstAddr, dstPort, msg = undefined) {
    // let datagram = '';
    let payload = '';
    
    if (msg !== undefined) {
      msg.split('').forEach((element) => {
        payload += element.charCodeAt().toString(2).padStart(8, '0');
      });
    } else {
      payload = this.datagramData.binary;
    }
    
    let payloadLength = payload.length;
    this.datagram = [];
    this.binHeader = '';

    this.setSourcePort(srcPort)
      .setDestinationPort(dstPort)
      .setLength(payloadLength)
      .setChecksum()
      .setData(payload, msg)
      .calculateChecksum(srcAddr, dstAddr);
    
    // this.datagram.forEach((element) => {
    //   datagram += element.binary;
    // });
    console.log('UDP datagram encapsulation done.');
    return this.datagram;
  }

  decapsulateDatagram(datagram, srcAddr, dstAddr) {
    if (typeof datagram !== 'string') {
      throw new Error('UDP datagram must be a string!');
    }

    const prefix = 'datagram';
    let count = 0;
    let str = '';
    this.datagram = [];
    this.binHeader = '';

    for (let [key, value] of UDPHeaderLengthMap) {
      this[prefix + key] = {
        name: key,
        length: value,
      }
      str = datagram.slice(count, count + value);
      this[prefix + key].value = parseInt(str, 2);
      this[prefix + key].binary = str;
      this[prefix + key].hex = this.getHex(str);
      this.datagram.push(this[prefix + key]);
      this.binHeader += str;
      count += value;
    }
    this.datagramData = {
      name: 'Data',
      length: datagram.length - count,
      value: this.parseData(datagram.slice(count)),
      binary: datagram.slice(count),
      hex: this.getHex(datagram.slice(count)),
    };
    this.datagram.push(this.datagramData);

    this.checkChecksum(srcAddr, dstAddr);
    // this.checkPort();
    return this.datagram;
  }

  getHex(binary) {
    let str = '';

    for (let i = binary.length; i > 0; i -= 4) {
      let sliceStr = '';
      if (i - 4 < 0) {
        sliceStr = binary.slice(0, i);
      } else {
        sliceStr = binary.slice(i - 4, i);
      }

      str += (parseInt(sliceStr, 2).toString(16)).toUpperCase();
    }

    return '0x' + str.split('').reverse().join('');
  }

  parseData(binary) {
    let data = '';

    for (let i = 0; i < binary.length; i += 8) {
      data += String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
    }

    return data;
  }

  setSourcePort(port) {
    let datagramSourcePort = {
      name: 'SourcePort',
      length: UDPHeaderLengthMap.get('SourcePort'),
      value: port,
      binary: port.toString(2).padStart(UDPHeaderLengthMap.get('SourcePort'), '0'),
    };
    datagramSourcePort.hex = this.getHex(datagramSourcePort.binary);

    this.datagramSourcePort = datagramSourcePort;
    this.datagram.push(datagramSourcePort);
    this.binHeader += datagramSourcePort.binary;
    console.log(datagramSourcePort);
    console.log('UDP source port has been set.');
    return this;
  }

  setDestinationPort(port) {
    let datagramDestinationPort = {
      name: 'DestinationPort',
      length: UDPHeaderLengthMap.get('DestinationPort'),
      value: port,
      binary: port.toString(2).padStart(UDPHeaderLengthMap.get('DestinationPort'), '0'),
    };
    datagramDestinationPort.hex = this.getHex(datagramDestinationPort.binary);

    this.datagramDestinationPort = datagramDestinationPort;
    this.datagram.push(datagramDestinationPort);
    this.binHeader += datagramDestinationPort.binary;
    console.log(datagramDestinationPort);
    console.log('UDP destination port has been set.');
    return this;
  }

  setLength(payloadLength) {
    let datagramLength = {
      name: 'Length',
      length: UDPHeaderLengthMap.get('Length'),
      value: payloadLength + 64
    }
    datagramLength.binary = datagramLength.value.toString(2)
                              .padStart(UDPHeaderLengthMap.get('Length'), '0');
    datagramLength.hex = this.getHex(datagramLength.binary);

    this.datagramLength = datagramLength;
    this.datagram.push(datagramLength);
    this.binHeader += datagramLength.binary;
    console.log(datagramLength);
    console.log('UDP length has been set.');
    return this;
  }

  setChecksum() {
    let datagramChecksum = {
      name: 'Checksum',
      length: UDPHeaderLengthMap.get('Checksum'),
      value: 0,
      binary: ''.padStart(UDPHeaderLengthMap.get('Checksum'), '0'),
    };
    datagramChecksum.hex = this.getHex(datagramChecksum.binary);

    this.datagramChecksum = datagramChecksum;
    this.datagram.push(datagramChecksum);
    this.binHeader += datagramChecksum.binary;
    console.log(datagramChecksum);
    console.log('UDP checksum has been set.');
    return this;
  }

  setData(data, msg = undefined) {
    let datagramData = {
      name: 'Data',
      length: data.length,
      value: msg? msg : 'unresolved',
      binary: data,
    };
    datagramData.hex = this.getHex(datagramData.binary);

    this.datagramData = datagramData;
    this.datagram.push(datagramData);
    console.log(datagramData);
    console.log('UDP data has been set.');
    return this;
  }

  // not all UDP datagram use checksum, in this case, checksum equals 0
  // checksum for IPv4
  calculateChecksum(srcAddr, dstAddr) {
    const protocol = 17;
    let IPv4PseudoHeader = '';
    let arr = [];
    let str = '';
    let sum = 0;

    srcAddr.split('.').forEach((element) => {
      IPv4PseudoHeader += parseInt(element).toString(2).padStart(8, '0');
    });
    dstAddr.split('.').forEach((element) => {
      IPv4PseudoHeader += parseInt(element).toString(2).padStart(8, '0');
    });
    IPv4PseudoHeader += ''.padStart(8, '0');
    IPv4PseudoHeader += protocol.toString(2).padStart(8, '0');
    IPv4PseudoHeader += this.datagramLength.binary;
    this.binHeader = IPv4PseudoHeader + this.binHeader;

    for (let i = 0; i < this.binHeader.length; i += 16) {
      str = this.binHeader.slice(i, i + 16);
      sum += parseInt(str, 2);
    }
    
    while (sum >= 2 ** 16) {
      sum = sum % (2 ** 16) + parseInt(sum / (2 ** 16));
    }

    arr = sum.toString(2).padStart(16, '0').split('');
    for (let i in arr) {
      arr[i] = (arr[i] === '0')? '1' : '0';
    }
    this.datagramChecksum.binary = arr.join('').padStart(UDPHeaderLengthMap.get('Checksum'), '0');
    this.datagramChecksum.value = parseInt(this.datagramChecksum.binary, 2);
    this.datagramChecksum.hex = this.getHex(this.datagramChecksum.binary);
    this.datagram.forEach((element) => {
      if (element.name === 'Checksum') {
        element = this.datagramChecksum;
      }
    });
    console.log(this.datagramChecksum);
    console.log('UDP checksum has been calculated.');
    return this;
  }

  checkChecksum(srcAddr, dstAddr) {
    const protocol = 17;
    let IPv4PseudoHeader = '';
    let str = '';
    let sum = 0;

    srcAddr.split('.').forEach((element) => {
      IPv4PseudoHeader += parseInt(element).toString(2).padStart(8, '0');
    });
    dstAddr.split('.').forEach((element) => {
      IPv4PseudoHeader += parseInt(element).toString(2).padStart(8, '0');
    });
    IPv4PseudoHeader += ''.padStart(8, '0');
    IPv4PseudoHeader += protocol.toString(2).padStart(8, '0');
    IPv4PseudoHeader += this.datagramLength.binary;
    this.binHeader = IPv4PseudoHeader + this.binHeader;

    for (let i = 0; i < this.binHeader.length; i += 16) {
      str = this.binHeader.slice(i, i + 16);
      sum += parseInt(str, 2);
    }

    while (sum >= 2 ** 16) {
      sum = sum % (2 ** 16) + parseInt(sum / (2 ** 16));
    }

    if (sum !== 2 ** 16 - 1) {
      throw new Error('Checksum incorrect!');
    } else {
      console.log('Checksum correct.');
    }

    return this;
  }
}

export { UDPDatagram };
// This is a demo
// console.log('------------Encapsulation------------');
// let transportLayer1 = new UDPDatagram('192.168.80.230', 4000);
// let srcAddr = transportLayer1.addr;
// let srcPort = transportLayer1.port;
// let datagram = transportLayer1.encapsulateDatagram(srcAddr, srcPort, '192.168.80.231', 4001, 'Hello');
// console.log(`Datagram: ${ datagram }`);
// console.log('------------Decapsulation------------');
// let transportLayer2 = new UDPDatagram('192.168.80.231', 4001);
// let datagramArray = transportLayer2.decapsulateDatagram(datagram, '192.168.80.230', '192.168.80.231');
// datagramArray.forEach((element) => {
//   console.log(element);
// });
