/**
 * @author Henry Wong
 * see the end of the code for an example
 */

/**
 * TCP header length
 * The unit of length is bit
 * Every part of TCP header is presented in order
 */
const TCPHeaderLengthMap = new Map([
  ['SourcePort',            16],
  ['DestinationPort',       16],
  ['SequenceNumber',        32],
  ['AcknowledgementNumber', 32],
  ['DataOffset',             4],
  ['Reserved',               3],
  ['Flags',                  9],
  ['WindowSize',            16],
  ['Checksum',              16],
  ['UrgentPointer',         16],
  ['Options',              320],
]);

class TCPSegment {
  constructor(addr, port) {
    this.segment = [];
    this.binHeader = '';
    this.addr = addr;
    this.port = port;
  }

  encapsulateSegment(srcAddr, srcPort, dstAddr, dstPort, msg = undefined, random = 0, seq = 0, ack = 0, flags = {
    NS:  0,
    CWR: 0,
    ECE: 0,
    URG: 0,
    ACK: 0,
    PSH: 0,
    RST: 0,
    SYN: 0,
    FIN: 0,
  }, windowSize = 2000) {
    // let segment = '';
    let payload = '';

    if (msg !== undefined) {
      msg.split('').forEach((element) => {
        payload += element.charCodeAt().toString(2).padStart(8, '0');
      });
    } else {
      payload = this.datagramData.binary;
    }

    this.segment = [];
    this.binHeader = '';
    this.setSourcePort(srcPort)
      .setDestinationPort(dstPort)
      .setSequenceNumber(random, seq)
      .setAcknowledgementNumber(ack)
      .setDataOffset()
      .setReserved()
      .setFlags(flags)
      .setWindowSize(windowSize)
      .setChecksum()
      .setUrgentPointer()
      .setOptions()
      .setPadding()
      .setData(payload, msg)
      .calculateChecksum(srcAddr, dstAddr);

    // this.segment.forEach((element) => {
    //   segment += element.binary;
    // });
    console.log('TCP segment encapsulation done.');
    return this.segment;
  }

  decapsulateSegment(segment, srcAddr, dstAddr) {
    if (typeof segment !== 'string') {
      throw new Error('TCP segment must be a string!');
    }

    const prefix = 'segment';
    let count = 0;
    let str = '';
    this.segment = [];
    this.binHeader = '';

    for (let [key, value] of TCPHeaderLengthMap) {
      if (key === 'Options') {
        break;
      }

      this[prefix + key] = {
        name: key,
        length: value,
      }
      str = segment.slice(count, count + value);
      this[prefix + key].value = parseInt(str, 2);
      this[prefix + key].binary = str;
      this[prefix + key].hex = this.getHex(str);
      this.segment.push(this[prefix + key]);
      this.binHeader += str;
      count += value;
    }
    this.segmentData = {
      name: 'Data',
      length: segment.length - count,
      value: this.parseData(segment.slice(count)),
      binary: segment.slice(count),
      hex: this.getHex(segment.slice(count)),
    };
    this.segment.push(this.segmentData);

    this.checkChecksum(srcAddr, dstAddr);
    // this.checkPort();
    return this.segment;
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
    let segmentSourcePort = {
      name: 'SourcePort',
      length: TCPHeaderLengthMap.get('SourcePort'),
      value: port,
      binary: port.toString(2).padStart(TCPHeaderLengthMap.get('SourcePort'), '0'),
    };
    segmentSourcePort.hex = this.getHex(segmentSourcePort.binary);

    this.segmentSourcePort = segmentSourcePort;
    this.segment.push(segmentSourcePort);
    this.binHeader += segmentSourcePort.binary;
    console.log(segmentSourcePort);
    console.log('TCP source port has been set.');
    return this;
  }

  setDestinationPort(port) {
    let segmentDestinationPort = {
      name: 'DestinationPort',
      length: TCPHeaderLengthMap.get('DestinationPort'),
      value: port,
      binary: port.toString(2).padStart(TCPHeaderLengthMap.get('DestinationPort'), '0'),
    };
    segmentDestinationPort.hex = this.getHex(segmentDestinationPort.binary);

    this.segmentDestinationPort = segmentDestinationPort;
    this.segment.push(segmentDestinationPort);
    this.binHeader += segmentDestinationPort.binary;
    console.log(segmentDestinationPort);
    console.log('TCP destination port has been set.');
    return this;
  }

  // for display purpose, seq is not a random number
  setSequenceNumber(random, seq = 0) {
    let hexRandom = '0x' + random.toString(16).padStart(8, '0').toUpperCase();
    let segmentSequenceNumber = {
      name: 'SequenceNumber',
      length: TCPHeaderLengthMap.get('SequenceNumber'),
      value: hexRandom + ' (' + seq + ')',
      binary: random.toString(2).padStart(TCPHeaderLengthMap.get('SequenceNumber'), '0'),
    };
    segmentSequenceNumber.hex = this.getHex(segmentSequenceNumber.binary);

    this.segmentSequenceNumber = segmentSequenceNumber;
    this.segment.push(segmentSequenceNumber);
    this.binHeader += segmentSequenceNumber.binary;
    console.log(segmentSequenceNumber);
    console.log('TCP sequence number has been set.');
    return this;
  }

  setAcknowledgementNumber(ack = 0) {
    let segmentAcknowledgementNumber = {
      name: 'AcknowledgementNumber',
      length: TCPHeaderLengthMap.get('AcknowledgementNumber'),
      value: ack,
      binary: ack.toString(2).padStart(TCPHeaderLengthMap.get('AcknowledgementNumber'), '0'),
    };
    segmentAcknowledgementNumber.hex = this.getHex(segmentAcknowledgementNumber.binary);

    this.segmentAcknowledgementNumber = segmentAcknowledgementNumber;
    this.segment.push(segmentAcknowledgementNumber);
    this.binHeader += segmentAcknowledgementNumber.binary;
    console.log(segmentAcknowledgementNumber);
    console.log('TCP acknowledgement number has been set.');
    return this;
  }

  // the unit of offset is 4 bytes, 32 bits
  setDataOffset(offset = 5) {
    let segmentDataOffset = {
      name: 'DataOffset',
      length: TCPHeaderLengthMap.get('DataOffset'),
      value: offset,
      binary: offset.toString(2).padStart(TCPHeaderLengthMap.get('DataOffset'), '0'),
    };
    segmentDataOffset.hex = this.getHex(segmentDataOffset.binary);

    this.segmentDataOffset = segmentDataOffset;
    this.segment.push(segmentDataOffset);
    this.binHeader += segmentDataOffset.binary;
    console.log(segmentDataOffset);
    console.log('TCP data offset has been set.');
    return this;
  }

  setReserved() {
    let segmentReserved = {
      name: 'Reserved',
      length: TCPHeaderLengthMap.get('Reserved'),
      value: 0,
      binary: ''.toString(2).padStart(TCPHeaderLengthMap.get('Reserved'), '0'),
    };
    segmentReserved.hex = this.getHex(segmentReserved.binary);

    this.segmentReserved = segmentReserved;
    this.segment.push(segmentReserved);
    this.binHeader += segmentReserved.binary;
    console.log(segmentReserved);
    console.log('TCP reserved has been set.');
    return this;
  }

  // param `flags` must be an object follow is an example
  // {
  //   NS:  0,
  //   CWR: 0,
  //   ECE: 0,
  //   URG: 0,
  //   ACK: 0,
  //   PSH: 0,
  //   RST: 0,
  //   SYN: 0,
  //   FIN: 0,
  // }
  setFlags(flags) {
    let segmentFlags = {
      name: 'Flags',
      length: TCPHeaderLengthMap.get('Flags'),
      value: flags,
      binary: '',
    };
    segmentFlags.binary += flags.NS? '1' : '0';
    segmentFlags.binary += flags.CWR? '1' : '0';
    segmentFlags.binary += flags.ECE? '1' : '0';
    segmentFlags.binary += flags.URG? '1' : '0';
    segmentFlags.binary += flags.ACK? '1' : '0';
    segmentFlags.binary += flags.PSH? '1' : '0';
    segmentFlags.binary += flags.RST? '1' : '0';
    segmentFlags.binary += flags.SYN? '1' : '0';
    segmentFlags.binary += flags.FIN? '1' : '0';
    segmentFlags.hex = this.getHex(segmentFlags.binary);

    this.segmentFlags = segmentFlags;
    this.segment.push(segmentFlags);
    this.binHeader += segmentFlags.binary;
    console.log(segmentFlags);
    console.log('TCP flags has been set.');
    return this;
  }

  // 0 window size means getting the latest window size
  setWindowSize(windowSize = 0) {
    let segmentWindowSize = {
      name: 'WindowSize',
      length: TCPHeaderLengthMap.get('WindowSize'),
      value: windowSize,
      binary: windowSize.toString(2).padStart(TCPHeaderLengthMap.get('WindowSize'), '0'),
    };
    segmentWindowSize.hex = this.getHex(segmentWindowSize.binary);

    this.segmentWindowSize = segmentWindowSize;
    this.segment.push(segmentWindowSize);
    this.binHeader += segmentWindowSize.binary;
    console.log(segmentWindowSize);
    console.log('TCP window size has been set.');
    return this;
  }

  setChecksum() {
    let segmentChecksum = {
      name: 'Checksum',
      length: TCPHeaderLengthMap.get('Checksum'),
      value: 0,
      binary: ''.toString(2).padStart(TCPHeaderLengthMap.get('Checksum'), '0'),
    };
    segmentChecksum.hex = this.getHex(segmentChecksum.binary);

    this.segmentChecksum = segmentChecksum;
    this.segment.push(segmentChecksum);
    this.binHeader += segmentChecksum.binary;
    console.log(segmentChecksum);
    console.log('TCP checksum has been set.');
    return this;
  }

  // only valid when URG = 1
  setUrgentPointer(ptr = 0) {
    let segmentUrgentPointer = {
      name: 'UrgentPointer',
      length: TCPHeaderLengthMap.get('UrgentPointer'),
      value: ptr,
      binary: ptr.toString(2).padStart(TCPHeaderLengthMap.get('UrgentPointer'), '0'),
    };
    segmentUrgentPointer.hex = this.getHex(segmentUrgentPointer.binary);

    this.segmentUrgentPointer = segmentUrgentPointer;
    this.segment.push(segmentUrgentPointer);
    this.binHeader += segmentUrgentPointer.binary;
    console.log(segmentUrgentPointer);
    console.log('TCP urgent pointer has been set.');
    return this;
  }

  // see https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure
  setOptions() {
    console.log('Don\'t support TCP header options!');
    return this;
  }

  // when options apply, pad 0 to make header a 32-bit multiple
  setPadding(hasOptions = false) {
    return this;
  }

  setData(data, msg = undefined) {
    let segmentData = {
      name: 'Data',
      length: data.length,
      value: msg? msg : 'unresolved',
      binary: data,
    };
    segmentData.hex = this.getHex(segmentData.binary);

    this.segmentData = segmentData;
    this.segment.push(segmentData);
    console.log(segmentData);
    console.log('TCP data has been set.');
    return this;
  }

  // checksum for IPv4
  calculateChecksum(srcAddr, dstAddr) {
    const protocol = 6;
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
    IPv4PseudoHeader += (this.segmentDataOffset.value * 32 + this.segmentData.length).toString(2)
                          .padStart(16, '0');
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
    this.segmentChecksum.binary = arr.join('').padStart(TCPHeaderLengthMap.get('Checksum'), '0');
    this.segmentChecksum.value = parseInt(this.segmentChecksum.binary, 2);
    this.segmentChecksum.hex = this.getHex(this.segmentChecksum.binary);
    this.segment.forEach((element) => {
      if (element.name === 'Checksum') {
        element = this.segmentChecksum;
      }
    });
    console.log(this.segmentChecksum);
    console.log('TCP checksum has been calculated.');
    return this;
  }

  checkChecksum(srcAddr, dstAddr) {
    const protocol = 6;
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
    IPv4PseudoHeader += (this.segmentDataOffset.value * 32 + this.segmentData.length).toString(2)
                          .padStart(16, '0');
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

export { TCPSegment };

// This is a demo
// console.log('------------Encapsulation------------');
// let transportLayer1 = new TCPSegment('192.168.80.230', 4000);
// let srcAddr = transportLayer1.addr;
// let srcPort = transportLayer1.port;
// let seq = 0;
// let ack = 0;
// let flags = {
//   NS:  0,
//   CWR: 0,
//   ECE: 0,
//   URG: 0,
//   ACK: 0,
//   PSH: 0,
//   RST: 0,
//   SYN: 0,
//   FIN: 0,
// };
// let windowSize = 2000;
// let msg = 'Hello';
// let segment = transportLayer1.encapsulateSegment(srcAddr, srcPort, '192.168.80.231', 4001, seq, ack, flags, windowSize, msg);
// console.log(`Segment:\n${ segment }`);
// console.log('------------Decapsulation------------');
// let transportLayer2 = new TCPSegment('192.168.80.231', 4001);
// let dstAddr = transportLayer2.addr;
// let dstPort = transportLayer2.port;
// let datagramArray = transportLayer2.decapsulateSegment(segment, srcAddr, dstAddr);
// datagramArray.forEach((element) => {
//   console.log(element);
// });
