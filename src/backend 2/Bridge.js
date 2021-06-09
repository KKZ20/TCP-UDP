// Bridge.js
// 进行表单数据的检查

// 检查表单数据的类
class FormInfo {
  constructor(mac, ip, port) {
    this.mac = mac;
    this.ip = ip;
    this.port = port;
  }

  // 清空数据
  clear() {
    this.mac = '';
    this.ip = '';
    this.port = '';
  }

  // 总体检查函数，依次调用下列函数
  check() {
    this.errMsg = [];

    this.checkMAC(this.mac)
      .checkIP(this.ip)
      .checkPort(this.port)
  
    return this.errMsg;
  }

  // 检查mac地址的有效性，必须是“12-34-56-78-90-ab”
  checkMAC(MAC) {
    let arr = [];

    if (typeof MAC !== 'string') {
      this.errMsg.push('MAC address should be a string!');
      return this;
    }

    arr = MAC.split('-');
    if (arr.length !== 6) {
      this.errMsg.push('MAC address format invalid! Try xx-xx-xx-xx-xx-xx.');
      return this;
    }

    arr.forEach((element) => {
      if (element.length !== 2) {
        this.errMsg.push('MAC address format invalid!');
        return this;
      }
    });

    arr = arr.map((element) => {
      return parseInt(element, 16);
    });

    arr.forEach((element) => {
      if (Number.isNaN(element) || element < 0 || element > 255) {
        this.errMsg.push('MAC address value invalid!');
        return this;
      }
    });

    return this;
  }

  // 检查IP地址的有效性，必须是点分十进制的形式
  checkIP(IP) {
    let arr = [];

    if (typeof IP !== 'string') {
      this.errMsg.push('IP address should be a string!');
      return this;
    }

    arr = IP.split('.');
    if (arr.length !== 4) {
      this.errMsg.push('IP address should be dotted decimal notation!');
      return this;
    }

    arr = arr.map((element) => {
      return parseInt(element);
    });

    arr.forEach((element) => {
      if (Number.isNaN(element) || element < 0 || element > 255) {
        this.errMsg.push('IP address invalid!');
        return this;
      }
    });

    return this;
  }

  // 检查端口号有效性
  checkPort(Port) {
    if (typeof Port !== 'number' || Number.isNaN(Port)) {
      this.errMsg.push('Port should be a number!');
      return this;
    }

    if (Port < 0 || Port > 65535) {
      this.errMsg.push('Port invalid! Try 0 - 65535.');
    }
    return this;
  }
}


export { FormInfo };
