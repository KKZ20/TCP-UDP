/**
 * @author Henry Wong
 * 包装IP头部
 */

// IPv4首部各部分长度（位）
// TODO: remove this and replace it with map below
const IPv4HeaderLength = {
  version:               4,
  IHL:                   4,
  DSCP:                  6,
  ECN:                   2,
  totalLength:          16,
  identification:       16,
  flags:                 3,
  fragmentOffset:       13,
  timeToLive:            8,
  protocol:              8,
  headerChecksum:       16,
  sourceIPAddress:      32,
  destinationIPAddress: 32,
  options:             320,
};

// 同上
const IPv4HeaderLengthMap = new Map([
  ['Version',               4],
  ['IHL',                   4],
  ['DSCP',                  6],
  ['ECN',                   2],
  ['TotalLength',          16],
  ['Identification',       16],
  ['Flags',                 3],
  ['FragmentOffset',       13],
  ['TimeToLive',            8],
  ['Protocol',              8],
  ['HeaderChecksum',       16],
  ['SourceIPAddress',      32],
  ['DestinationIPAddress', 32],
  ['Options',             320],
]);

// 包装IPv4头部类
class IPv4Packet {
  constructor(srcAddr) {
    this.packet = [];
    this.binHeader = '';
    this.addr = srcAddr;
  }

  // 包装头部，依次调用下列函数
  encapsulatePacket(srcAddr, dstAddr, data, msg = undefined, ttl = 128) {
    // let packet = '';

    this.packet = [];
    this.binHeader = '';

    this.setVersion()
      .setIHL()
      .setDSCP()
      .setECN()
      .setTotalLength(data.length)
      .setIdentification()
      .setFlags()
      .setFragmentOffset()
      .setTimeToLive(ttl)
      .setProtocol()
      .setHeaderChecksum()
      .setSourceIPAddress(srcAddr)
      .setDestinationIPAddress(dstAddr)
      .setOptions()
      .setPadding()
      .setData(data, msg)
      .calculateChecksum();
    
    // this.packet.forEach((element) => {
    //   packet += element.binary;
    // });
    console.log('IPv4 packet encapsulation done.');
    return this.packet;
  }

  // 解包
  decapsulatePacket(packet) {
    if (typeof packet !== 'string') {
      throw new Error('IPv4 packet must be a string!');
    }

    const prefix = 'packet';
    let count = 0;
    let str = '';
    this.packet = [];
    this.binHeader = '';

    for (let [key, value] of IPv4HeaderLengthMap) {
      if (key === 'Options') {
        break;
      }
      this[prefix + key] = {
        name: key,
        length: value,
      }
      str = packet.slice(count, count + value);
      this[prefix + key].value = parseInt(str, 2);
      this[prefix + key].binary = str;
      this[prefix + key].hex = this.getHex(str);
      this.packet.push(this[prefix + key]);
      this.binHeader += str;
      count += value;
    }
    this.packetData = {
      name: 'Data',
      length: packet.length - count,
      value: this.parseData(packet.slice(count)),
      binary: packet.slice(count),
      hex: this.getHex(packet.slice(count)),
    };
    this.packet.push(this.packetData);

    this.checkChecksum();
    this.checkIPAddress();
    return this.packet;
  }

  // 二进制转十六进制
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

  // ASCII字符转二进制
  parseData(binary) {
    let data = '';

    for (let i = 0; i < binary.length; i += 8) {
      data += String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
    }

    return data;
  }

  // 设置版本
  setVersion(version = 4) {
    let packetVersion = {
      name: 'Version',
      length: IPv4HeaderLength.version,
      value: version,
      binary: version.toString(2).padStart(IPv4HeaderLength.version, '0'),
    };
    packetVersion.hex = this.getHex(packetVersion.binary);

    this.packetVersion = packetVersion;
    this.packet.push(packetVersion);
    this.binHeader += packetVersion.binary;
    console.log(packetVersion);
    console.log('IPv4 version has been set.');
    return this;
  }

  // 设置首部长度
  // Internet Header Length
  setIHL(length = 5) {
    let packetIHL = {
      name: 'IHL',
      length: IPv4HeaderLength.IHL,
      value: length,
      binary: length.toString(2).padStart(IPv4HeaderLength.IHL, '0'),
    };
    packetIHL.hex = this.getHex(packetIHL.binary);

    this.packetIHL = packetIHL;
    this.packet.push(packetIHL);
    this.binHeader += packetIHL.binary;
    console.log(packetIHL);
    console.log('IPv4 IHL has been set.');
    return this;
  }

  // 设置差分服务代码点
  // Differential Services Codepoint
  // see https://en.wikipedia.org/wiki/Differentiated_services#Configuration_guidelines
  setDSCP(diffServ = 0) {
    let packetDSCP = {
      name: 'DSCP',
      length: IPv4HeaderLength.DSCP,
      value: diffServ,
      binary: diffServ.toString(2).padStart(IPv4HeaderLength.DSCP, '0'),
    };
    packetDSCP.hex = this.getHex(packetDSCP.binary);

    this.packetDSCP = packetDSCP;
    this.packet.push(packetDSCP);
    this.binHeader += packetDSCP.binary;
    console.log(packetDSCP);
    console.log('IPv4 DSCP has been set.');
    return this;
  }

  // 设置显式拥塞通告
  // Explicit Congestion Notification
  setECN(hasECT = false) {
    let packetECN = {
      name: 'ECN',
      length: IPv4HeaderLength.ECN,
      value: {
        ECT: hasECT? 1 : 0, // ECN-Capable Transport
        CE: hasECT? 1 : 0, // Congenstion Experienced
      },
    };
    packetECN.binary = packetECN.value.ECT.toString() + packetECN.value.CE.toString();
    packetECN.hex = this.getHex(packetECN.binary);
    
    this.packetECN = packetECN;
    this.packet.push(packetECN);
    this.binHeader += packetECN.binary;
    console.log(packetECN);
    console.log('IPv4 ECN has been set.');
    return this;
  }

  // 设置总长度
  setTotalLength(payloadLength) {
    let packetTotalLength = {
      name: 'TotalLength',
      length: IPv4HeaderLength.totalLength,
      value: this.packetIHL.value * 4 + payloadLength / 8,
    };
    packetTotalLength.binary = packetTotalLength.value.toString(2)
                                .padStart(IPv4HeaderLength.totalLength, '0');
    packetTotalLength.hex = this.getHex(packetTotalLength.binary);

    this.packetTotalLength = packetTotalLength;
    this.packet.push(packetTotalLength);
    this.binHeader += packetTotalLength.binary;
    console.log(packetTotalLength);
    console.log('IPv4 total length has been set.');
    return this;
  }

  // 设置标识
  // 用于分片
  setIdentification(id = 0) {
    let packetIdentification = {
      name: 'Identification',
      length: IPv4HeaderLength.identification,
      value: id,
      binary: id.toString(2).padStart(IPv4HeaderLength.identification, '0'),
    };
    packetIdentification.hex = this.getHex(packetIdentification.binary);

    this.packetIdentification = packetIdentification;
    this.packet.push(packetIdentification);
    this.binHeader += packetIdentification.binary;
    console.log(packetIdentification);
    console.log('IPv4 identification has been set.');
    return this;
  }

  // 设置标志
  setFlags(dontFragment = true, moreFragment = false) {
    let packetFlags = {
      name: 'Flags',
      length: IPv4HeaderLength.flags,
      value: {
        bit0: 0,
        dontFragment: dontFragment? 1 : 0,
        moreFragment: moreFragment? 1 : 0,
      },
    };
    packetFlags.binary = packetFlags.value.bit0.toString() +
                          packetFlags.value.dontFragment.toString() +
                          packetFlags.value.moreFragment.toString();
    packetFlags.hex = this.getHex(packetFlags.binary);

    this.packetFlags = packetFlags;
    this.packet.push(packetFlags);
    this.binHeader += packetFlags.binary;
    console.log(packetFlags);
    console.log('IPv4 flags has been set.');
    return this;
  }

  // 设置片偏移
  setFragmentOffset(offset = 0) {
    let packetFragmentOffset = {
      name: 'FragmentOffset',
      length: IPv4HeaderLength.fragmentOffset,
      value: offset,
      binary: offset.toString(2).padStart(IPv4HeaderLength.fragmentOffset, '0'),
    };
    packetFragmentOffset.hex = this.getHex(packetFragmentOffset.binary);

    this.packetFragmentOffset = packetFragmentOffset;
    this.packet.push(packetFragmentOffset);
    this.binHeader += packetFragmentOffset.binary;
    console.log(packetFragmentOffset);
    console.log('IPv4 fragment offset has been set.');
    return this;
  }

  // 设置生存时间
  setTimeToLive(ttl = 128) {
    let packetTimeToLive = {
      name: 'TimeToLive',
      length: IPv4HeaderLength.timeToLive,
      value: ttl,
      binary: ttl.toString(2).padStart(IPv4HeaderLength.timeToLive, '0'),
    };
    packetTimeToLive.hex = this.getHex(packetTimeToLive.binary);

    this.packetTimeToLive = packetTimeToLive;
    this.packet.push(packetTimeToLive);
    this.binHeader += packetTimeToLive.binary;
    console.log(packetTimeToLive);
    console.log('IPv4 time to live has been set.');
    return this;
  }

  // 设置协议
  // IP: 4, TCP: 6, UDP: 17
  // see http://www.iana.org/assignments/protocol-numbers
  setProtocol(protocol = 6) {
    let packetProtocol = {
      name: 'Protocol',
      length: IPv4HeaderLength.protocol,
      value: protocol,
      binary: protocol.toString(2).padStart(IPv4HeaderLength.protocol, '0'),
    };
    packetProtocol.hex = this.getHex(packetProtocol.binary);

    this.packetProtocol = packetProtocol;
    this.packet.push(packetProtocol);
    this.binHeader += packetProtocol.binary;
    console.log(packetProtocol);
    console.log('IPv4 protocol has been set.');
    return this;
  }

  // 设置首部校验和
  setHeaderChecksum() {
    let packetHeaderChecksum = {
      name: 'HeaderChecksum',
      length: IPv4HeaderLength.headerChecksum,
      value: 0,
      binary: ''.padStart(IPv4HeaderLength.headerChecksum, '0'),
    };
    packetHeaderChecksum.hex = this.getHex(packetHeaderChecksum.binary);

    this.packetHeaderChecksum = packetHeaderChecksum;
    this.packet.push(packetHeaderChecksum);
    this.binHeader += packetHeaderChecksum.binary;
    console.log(packetHeaderChecksum);
    console.log('IPv4 header checksum has been set.');
    return this;
  }

  // 设置源IP地址
  setSourceIPAddress(addr) {
    let packetSourceIPAddress = {
      name: 'SourceIPAddress',
      length: IPv4HeaderLength.sourceIPAddress,
      value: addr,
      binary: '',
    };
    addr.split('.').forEach((element) => {
      packetSourceIPAddress.binary += parseInt(element).toString(2).padStart(8, '0');
    });
    packetSourceIPAddress.hex = this.getHex(packetSourceIPAddress.binary);

    this.packetSourceIPAddress = packetSourceIPAddress;
    this.packet.push(packetSourceIPAddress);
    this.binHeader += packetSourceIPAddress.binary;
    console.log(packetSourceIPAddress);
    console.log('IPv4 source IP address has been set.');
    return this;
  }

  // 设置目标IP地址
  setDestinationIPAddress(addr) {
    let packetDestinationIPAddress = {
      name: 'DestinationIPAddress',
      length: IPv4HeaderLength.destinationIPAddress,
      value: addr,
      binary: '',
    };
    addr.split('.').forEach((element) => {
      packetDestinationIPAddress.binary += parseInt(element).toString(2).padStart(8, '0');
    });
    packetDestinationIPAddress.hex = this.getHex(packetDestinationIPAddress.binary);

    this.packetDestinationIPAddress = packetDestinationIPAddress;
    this.packet.push(packetDestinationIPAddress);
    this.binHeader += packetDestinationIPAddress.binary;
    console.log(packetDestinationIPAddress);
    console.log('IPv4 destination IP address has been set.');
    return this;
  }

  // 设置可选字段
  // see https://en.wikipedia.org/wiki/IPv4#Options
  setOptions() {
    console.log('Don\'t support IPv4 header options!');
    return this;
  }

  // 设置可选字段填充字节
  // when options apply, pad 0 to make header a 32-bit multiple
  setPadding(hasOptions = false) {
    return this;
  }

  // 设置数据（载荷）
  setData(data, msg) {
    let packetData = {
      name: 'Data',
      length: data.length,
      value: msg? msg : 'unresolved',
      binary: data,
    };
    packetData.hex = this.getHex(packetData.binary);

    this.packetData = packetData;
    this.packet.push(packetData);
    console.log(packetData);
    console.log('IPv4 data has been set.');
    return this;
  }

  // 计算首部检验和
  calculateChecksum() {
    let arr = [];
    let str = '';
    let sum = 0;

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
    this.packetHeaderChecksum.binary = arr.join('').padStart(IPv4HeaderLength.headerChecksum, '0');
    this.packetHeaderChecksum.value = parseInt(this.packetHeaderChecksum.binary, 2);
    this.packetHeaderChecksum.hex = this.getHex(this.packetHeaderChecksum.binary);
    this.packet.forEach((element) => {
      if (element.name === 'Header Checksum') {
        element = this.packetHeaderChecksum;
      }
    });
    console.log(this.packetHeaderChecksum);
    console.log('IPv4 header checksum has been calculated.');
    return this;
  }

  // 检查IP地址有效性
  checkIPAddress() {
    let str = '';
    let srcAddrArray = [], dstAddrArray = [];
    let srcAddr = '', dstAddr = '';
    let ttl;
    // source
    for (let i = 0; i < this.packetSourceIPAddress.length; i += 8) {
      str = this.packetSourceIPAddress.binary.slice(i, i + 8);
      srcAddrArray.push(parseInt(str, 2));
    }
    srcAddr = srcAddrArray.join('.');
    this.packetSourceIPAddress.value = srcAddr;
    // destination
    for (let i = 0; i < this.packetDestinationIPAddress.length; i += 8) {
      str = this.packetDestinationIPAddress.binary.slice(i, i + 8);
      dstAddrArray.push(parseInt(str, 2));
    }

    dstAddr = dstAddrArray.join('.');
    this.packetDestinationIPAddress.value = dstAddr;
    if (dstAddr !== this.addr) {
      console.log('Destination IP address unmatched!');
      console.log('Re-capsulate IPv4 packet.');
      ttl = this.packetTimeToLive.value - 1;
      if (ttl < 0) {
        throw new Error('TTL = 0!');
      }
      this.encapsulatePacket(srcAddr, dstAddr, undefined, ttl);
    } else {
      console.log('Destination IP address matched!');
    }

    return this;
  }

  // 检查校验和正确性
  checkChecksum() {
    let str = '';
    let sum = 0;

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

export { IPv4Packet };

// This is a demo
// console.log('------------Encapsulation------------');
// networkLayer1 = new IPv4Packet('192.168.80.230');
// let addr = networkLayer1.addr;
// let packet = networkLayer1.encapsulatePacket(addr, '192.168.80.231', 'Hello, World!');
// console.log(`Packet:\n${ packet }`);
// console.log('------------Decapsulation------------');
// networkLayer2 = new IPv4Packet('192.168.80.231');
// let packetArray = networkLayer2.decapsulatePacket(packet);
// console.log(`Packet info:`);
// packetArray.forEach((element) => {
//   console.log(element);
// });
// console.log('---------Decapsulation Check---------');
// networkLayer3 = new IPv4Packet('192.168.80.232');
// let rePacket = networkLayer3.decapsulatePacket(packet);
