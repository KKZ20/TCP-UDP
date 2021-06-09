/**
 * @author Henry Wong
 * 包装以太网帧头部
 */

// Ethernet II 帧头部各部分的长度（位）
// Ethernet II Header Structure
// NOTICE PAYLOAD IS IN OCTET / BYTE FORM WHILE OTHERS ARE IN BITS
const EthHeaderLengthMap = new Map([
  ['Preamble',           56],
  ['StartFrameDelimiter', 8],
  ['MACDestination',     48],
  ['MACSource',          48],
  ['Ethertype',          16],
  ['FrameCheckSequence', 32],
]);

// Ethertype Definition
// eslint-disable-next-line no-unused-vars
const EthertypeDefinition = {
  IPv4: '0800',
  VLAN: '8100',
  IPv6: '86DD',
};

// 包装以太网帧的类
class EthernetFrame {
  constructor(mac) {
    this.mac = mac;
    this.frame = [];
    this.binHeader = '';
  }

  // 封装帧头部总函数，依次调用下列函数
  encapsulateFrame(macSrc, macDst, payload, msg = undefined, Ethertype = '0800') {
    this.frame = [];
    this.binHeader = '';

    this.setPreamble()
      .setStartFrameDelimiter()
      .setMACDestination(macSrc)
      .setMACSource(macDst)
      .setEthertype(Ethertype)
      .setData(payload, msg)
      .setPadding()
      .setFrameCheckSequence();

    console.log('Ethernet frame has been encapsulated.');
    return this.frame;
  }

  // 解封
  // decapsulateFrame(frame) {
  //   if (typeof frame !== 'string') {
  //     throw new Error('Ethernet frame must be a string.');
  //   }

  //   let count = 0;
  //   let decapsulatedFrame = {};
  //   Object.keys(this.EthernetHeader).forEach((key) => {
  //     if (key !== 'payload') {
  //       this[key] = frame.substring(count, count + this.EthernetHeader[key]);
  //       count += this.EthernetHeader[key];
  //     } else {
  //       this[key] = frame.substring(count);
  //     }
  //     decapsulatedFrame[key] = this[key];
  //   });

  //   decapsulatedFrame.MACMatch = this.checkMACAddress();
  //   decapsulatedFrame.EthertypeName = this.checkEthertype();

  //   console.log('Ethernet frame has been decapsulated.');
  //   console.log(decapsulatedFrame);
  //   return decapsulatedFrame;
  // }

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

  // 设置前导码
  setPreamble() {
    const preambleOctet = '10101010';
    let preamble = '';
    for (let i = 0; i < EthHeaderLengthMap.get('Preamble') / preambleOctet.length; i++) {
      preamble += preambleOctet;
    }

    let framePreamble = {
      name: 'Preamble',
      length: EthHeaderLengthMap.get('Preamble'),
      value: preambleOctet,
      binary: preamble,
    };
    framePreamble.hex = this.getHex(framePreamble.binary);

    this.framePreamble = framePreamble;
    this.frame.push(framePreamble);
    console.log(framePreamble);
    console.log('Ethernet preamble has been set.');
    return this;
  }

  // 设置SFD
  setStartFrameDelimiter() {
    let frameStartFrameDelimiter = {
      name: 'StartFrameDelimiter',
      length: EthHeaderLengthMap.get('StartFrameDelimiter'),
      value: '10101011',
      binary: '10101011',
    };
    frameStartFrameDelimiter.hex = this.getHex(frameStartFrameDelimiter.binary);

    this.frameStartFrameDelimiter = frameStartFrameDelimiter;
    this.frame.push(frameStartFrameDelimiter);
    console.log(frameStartFrameDelimiter);
    console.log('Ethernet start frame delimiter has been set.');
    return this;
  }

  // 设置目标MAC地址
  setMACDestination(dstMac) {
    let frameMACDestination = {
      name: 'MACDestination',
      length: EthHeaderLengthMap.get('MACDestination'),
      value: dstMac,
      binary: '',
    };
    dstMac.split('-').join('').split('').forEach((element) => {
      frameMACDestination.binary += parseInt(element, 16).toString(2).padStart(4, '0');
    });
    frameMACDestination.hex = this.getHex(frameMACDestination.binary);

    this.frameMACDestination = frameMACDestination;
    this.frame.push(frameMACDestination);
    this.binHeader += frameMACDestination.binary;
    console.log(frameMACDestination);
    console.log('Ethernet MAC destination has been set.');
    return this;
  }

  // 设置源MAC地址
  setMACSource(srcMac) {
    let frameMACSource = {
      name: 'MACSource',
      length: EthHeaderLengthMap.get('MACSource'),
      value: srcMac,
      binary: '',
    };
    srcMac.split('-').join('').split('').forEach((element) => {
      frameMACSource.binary += parseInt(element, 16).toString(2).padStart(4, '0');
    });
    frameMACSource.hex = this.getHex(frameMACSource.binary);

    this.frameMACSource = frameMACSource;
    this.frame.push(frameMACSource);
    this.binHeader += frameMACSource.binary;
    console.log(frameMACSource);
    console.log('Ethernet MAC source has been set.');
    return this;
  }

  // 设置类型
  // More info at standards.ieee.org/regauth/ethertype/eth.txt
  setEthertype(ethertype = '0800') {
    let frameEthertype = {
      name: 'Ethertype',
      length: EthHeaderLengthMap.get('Ethertype'),
      value: ethertype + '(IPv4)',
      binary: ethertype,
    };
    frameEthertype.hex = this.getHex(frameEthertype.binary);

    this.frameEthertype = frameEthertype;
    this.frame.push(frameEthertype);
    this.binHeader += frameEthertype.binary;
    console.log(frameEthertype);
    console.log('Ethernet Ethertype has been set.');
    return this;
  }

  // 设置数据（载荷）
  setData(data, msg = undefined) {
    let frameData = {
      name: 'Data',
      length: data.length,
      value: msg? msg : 'unresolved',
      binary: data,
    };
    frameData.hex = this.getHex(frameData.binary);

    if (data.length > 1500 * 8) {
      alert('Exceed maximum Ethernet frame payload length!');
    }

    this.frameData = frameData;
    this.frame.push(frameData);
    this.binHeader += frameData.binary;
    console.log(frameData);
    console.log('Ethernet payload data has been set.');
    return this;
  }

  // 设置填充字节
  setPadding() {
    if (this.frameData.length < 46 * 8) {
      let framePadding = {
        name: 'Padding',
        length: 46 * 8 - this.frameData.length,
        value: 0,
        binary: ''.padStart(46 * 8 - this.frameData.length, '0'),
      };
      framePadding.hex = this.getHex(framePadding.binary);

      this.framePadding = framePadding;
      this.frame.push(framePadding);
      this.binHeader += framePadding.binary;
      console.log(framePadding);
      console.log('Ethernet payload data padding has been set.');
    }
    return this;
  }

  // 设置FCS，基于CRC32冗余校验码
  // 采用PHP中的CRC32方案
  setFrameCheckSequence() {
    let frameCheckSequence = {
      name: 'FrameCheckSequence',
      length: EthHeaderLengthMap.get('FrameCheckSequence'),
      value: '',
      binary: '',
    };

    const CRC32 = (data) => {
      const table = '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D';
      let crc = 0;
      let num = 0; // a number between 0 and 255
      let hex = 0; // a hex number
      crc = crc ^ (-1);
      for (let i = 0; i < data.length / 8; i += 8) {
        num = (crc ^ parseInt(data.slice(i, i + 8), 2)) & 0xFF;
        hex = "0x" + table.substr(num * 9, 8);
        crc = (crc >>> 8) ^ hex;
      }  
      return (crc ^ (-1)) >>> 0;
    };

    frameCheckSequence.value = CRC32(this.binHeader);
    frameCheckSequence.binary = frameCheckSequence.value.toString(2).padStart(EthHeaderLengthMap.get('FrameCheckSequence'), '0');
    frameCheckSequence.hex = this.getHex(frameCheckSequence.binary);
    frameCheckSequence.value = frameCheckSequence.hex;

    this.frameCheckSequence = frameCheckSequence;
    this.frame.push(frameCheckSequence);
    console.log(frameCheckSequence);
    console.log('Ethernet frame check sequence has been set.');
    return this;
  }

  // setInterpacketGap() {
  //   console.warn('Ethernet interpacket gap is not implemented by now.');
  //   return this;
  // }

  // checkMACAddress() {
  //   const binMACAddress = parseInt(this.MACAddress.split('-').join(''), 16)
  //     .toString(2)
  //     .padStart(this.EthernetHeader.MACSource, '0');
  //   if (this.MACAddress && this.MACDestination && binMACAddress === this.MACDestination) {
  //     console.log(`MAC Address matched: ${ this.MACAddress }`);
  //     return true;
  //   } else {
  //     console.error(`Unmatching MAC address. This frame is not accepted by host at ${ this.MACAddress }.`);
  //     return false;
  //   }
  // }

  // checkEthertype() {
  //   if (this.Ethertype) {
  //     const hexEthertype = parseInt(this.Ethertype, 2).toString(16).padStart(4, '0');
  //     const EthertypeName = Object.keys(EthertypeDefinition).find((key) => {
  //       return EthertypeDefinition[key] === hexEthertype;
  //     });
  //     console.log(`Ethertype checked: ${ EthertypeName }.`);
  //     return EthertypeName;
  //   }

  //   console.error('Ethertype not found. Use default Ethertype IPv4.');
  //   return 'IPv4';
  // }
}

export { EthernetFrame };

/**
 * This is a demo
 */
// let ethtest = new EthernetFrame('de-f1-23-45-67-89');
// let frame = ethtest.encapsulateFrame('12-34-56-78-9a-bc', 'Hello');
// let ethdemo = new EthernetFrame('12-34-56-78-9a-bc');
// let decapsulatedframe = ethdemo.decapsulateFrame(frame);
