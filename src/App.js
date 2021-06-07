import React from 'react';
// Ant-design
import { message } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import { Row, Col } from 'antd';
import { Carousel } from 'antd';
import { Layout } from 'antd';
import { Form, Input } from 'antd';
import { PageHeader, Tabs } from 'antd';
import { Radio } from 'antd';
import { Card } from 'antd';
import { Typography } from 'antd';
import { Popover } from 'antd';

import QueueAnim from 'rc-queue-anim';
// 数据部分
import { FormInfo } from './backend 2/Bridge';
import { TCPSegment } from './backend 2/TCP';
import { UDPDatagram } from './backend 2/UDP';
import { IPv4Packet } from './backend 2/IP';
import { EthernetFrame } from './backend 2/Ethernet';
import './App.css';


const { Paragraph } = Typography;
const { Header, Footer, Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;
const delayTime = 2000;

// 页面标题（Header）
function Title(props) {
  return (
    <h1 style={{ color: 'white', textAlign: 'center', fontSize: '30px' }}>
      {props.title}
    </h1>
  );
}

// 开发者信息（Footer）
function DeveloperInfo(props) {
  return (
    <>
      <div style={{ textAlign: 'center' }}>{props.info}</div>
      <br/>
      <div style={{ textAlign: 'center' }}>联系我们：{props.contact}</div>
    </>
  );
}

// function DataInfo(data) {
//   return (
//     <div> Data: { data }, length: { data.length * 8 } bits </div>
//   );
// }

// function DataHeaderInfo(dataHeaderInfo) {
//   let desc = [];
//   let valArray = [];
//   let count = 0

//   dataHeaderInfo.forEach((element) => {
//     if (typeof element.value === 'object') {
//       for (let key in element.value) {
//         valArray.push(
//           <ul key={ count++ }>
//             <li key={ count++ }>
//               { key }: { element.value[key] }
//             </li>
//           </ul>
//         );
//       }
//       desc.push(
//         <ul key={ count++ }>
//           <li key={ count++ }>
//             { element.name }, length: { element.length } bits
//             {/* { valArray } */}
//           </li>
//         </ul>
//       );
//     } else {
//       desc.push(
//         <ul key={ count++ }>
//           <li key={ count++ }>
//             { element.name }: { element.value }, length: { element.length } bits
//           </li>
//         </ul>
//       );
//     }
//   });
//   return (
//     <>
//       { desc }
//     </>
//   );
// }

// 布局的CSS样式
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 18,
  },
};

// 输入数据按钮（Header, Button）
// 可以自动填充表单
// 声明式组件
class DataInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleOK = this.handleOK.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleMAC = this.handleMAC.bind(this);
    this.handleIP = this.handleIP.bind(this);
    this.handlePort = this.handlePort.bind(this);
    this.handleData = this.handleData.bind(this);
    this.autoFill1 = this.autoFill1.bind(this);
    this.autoFill2 = this.autoFill2.bind(this);
    this.state = {
      firstModalVisible: false,
      secondModalVisible: false,
    };
    this.randomNum = 0;
  }
  formRef1 = React.createRef();
  formRef2 = React.createRef();
  // const [form] = Form.useForm();

  // 展示提交表单的对话框
  showModal() {
    this.setState({ firstModalVisible: true });
  }

  // 第一个表单（发送方相关信息）提交时触发
  handleNext(value) {
    // 提交第一个表单
    console.log('test: ', value);
    console.log(Object.keys(value)[1]);
    this.handleMAC(value.srcMAC, Object.keys(value)[0]);
    this.handleIP(value.srcIP, Object.keys(value)[1]);
    this.handlePort(value.srcPort, Object.keys(value)[2]);
    this.handleData(value.data);

    this.props.setSrcInfo();
    let firstCheck = this.props.checkInfo(1);
    if (!firstCheck.length) {
      this.setState({
        firstModalVisible: false,
        secondModalVisible: true,
      });
    }
    else {
      //TODO:
      // message.error('有错误信息！');
      firstCheck.forEach(element => {
        message.error(element, 3);
      });
    }
  }
  
  // 第二个表单（接收方相关信息）提交时触发
  handleOK(value) {
    // 提交第二个表单
    // console.log('test: ', value);
    this.handleMAC(value.desMAC, Object.keys(value)[0]);
    this.handleIP(value.desIP, Object.keys(value)[1]);
    this.handlePort(value.desPort, Object.keys(value)[2]);

    this.props.setDesInfo();
    let secondCheck = this.props.checkInfo(2);
    if (!secondCheck.length) {
      this.setState({
        firstModalVisible: false,
        secondModalVisible: false,
      });
      this.props.randomSeq();
    }
    else {
      //TODO:
      message.error('有错误信息！');
    }
    
  }

  // 第二个表单返回上一步时触发
  handlePrevious() {
    this.setState({
      firstModalVisible: true,
      secondModalVisible: false,
    });
  }

  // 第一个表单取消填写时触发
  handleClose() {
    this.setState({
        firstModalVisible: false,
        secondModalVisible: false,
    });
  }

  // 自动填充表单（第一个，发送方相关）
  autoFill1() {
    this.formRef1.current.setFieldsValue({
      srcMAC: 'AC-AC-BD-BD-AC-AC',
      srcIP: '192.168.49.230',
      srcPort: 4000,
      data: '11112222333hellosj',
    });
  }

  // 自动填充表单（第二个，接收方相关）
  autoFill2() {
    this.formRef2.current.setFieldsValue({
      desMAC: 'BD-BD-AC-AC-BD-11',
      desIP: '192.168.80.230',
      desPort: 12345,
    });
  }

  // handleMAC(e) {
  //   // console.log(e.target.id);
  //   this.props.getMAC(e.target.value, e.target.id);
  // }

  // handleIP(e) {
  //   this.props.getIP(e.target.value, e.target.id);
  // }

  // handlePort(e) {
  //   // console.log(value);
  //   this.props.getPort(e.target.value, e.target.id);
  // }

  // handleData(e) {
  //   this.props.getData(e.target.value);
  // }

  // 状态提升：交给父组件处理MAC地址
  handleMAC(value, id) {
    // console.log(e.target.id);
    this.props.getMAC(value, id);
  }

  // 状态提升：交给父组件处理IP地址
  handleIP(value, id) {
    // console.log(id);
    this.props.getIP(value, id);
  }

  // 状态提升：交给父组件处理端口号
  handlePort(value, id) {
    // console.log(value);
    this.props.getPort(value, id);
  }

  // 状态提升：交给父组件处理要传输的数据
  handleData(value) {
    this.props.getData(value);
  }

  render() {
    return (
      <>
        <Button onClick={this.showModal}>
          获取数据
        </Button>
        
        <Modal
          visible={this.state.firstModalVisible}
          title='发送方'
          width={750}
          // onOk={() => this.handleOK()}
          onCancel={this.handleClose}
          footer={[]}
        >
          <Form
            {...layout}
            // validateMessages={validateMessages}
            onFinish={this.handleNext}
            ref={this.formRef1}
          >
            <Form.Item
              label='MAC地址'
              labelAlign='left'
              name='srcMAC'
              rules={[
                {
                  required: true,
                  message: '请输入发送方的MAC地址！'
                }
              ]}
            >
              <Input
                id='srcMAC'
                style={{
                  textAlign: 'center',
                }}
                allowClear
                // maxLength={17}
                placeholder='请输入MAC地址（eg: AB-CD-EF-EF-CD-AB）'
                // onChange={this.handleMAC}
              />
            </Form.Item>

            <Form.Item
              label='IP地址'
              labelAlign='left'
              name='srcIP'
              rules={[
                {
                  required: true,
                  message: '请输入发送方的IP地址！'
                }
              ]}
            >
              <Input
                id='srcIP'
                // style={{
                //   textAlign: 'center',
                // }}
                allowClear
                // maxLength={17}
                placeholder='请输入IP地址（eg: 192.168.49.230）'
                // onChange={this.handleIP}
              />
            </Form.Item>

            <Form.Item
              label='端口号'
              labelAlign='left'
              name='srcPort'
              rules={[
                {
                  required: true,
                  message: '请输入发送方的端口号！',
                }
              ]}
            >
              {/* <Tooltip
                placement="top"
                title={<span>0~65535</span>}
              >
                <Input
                  min={0} max={65535}
                  maxLength={5}
                  style={{
                    width: '110px',
                  }}
                  placeholder='eg: 12345'
                  onChange={this.handleSrcPort}
                />
                
              </Tooltip> */}
              <Input
                id='srcPort'
                type='number'
                min={0}
                max={65535}
                maxLength={5}
                style={{
                  width: '110px',
                }}
                // allowClear
                // maxLength={17}
                placeholder='eg: 12344'
                // onChange={this.handlePort}
              />
            </Form.Item>

            <Form.Item
              label='数据'
              labelAlign='left'
              name='data'
              rules={[
                {
                  required: true,
                  message: '请输入要发送的数据！'
                }
              ]}
            >
              <TextArea
                // value={value}
                // onChange={this.handleData}
                placeholder="请输入要传输的数据"
                autoSize={{ minRows: 3, maxRows: 3 }}
              />
            </Form.Item>
            
            <Form.Item>
              <Row wrap={false}>
                <Col span={2} offset={18}>
                  <Button
                    type='link'
                    key='close'
                    htmlType='button'
                    onClick={this.autoFill1}
                  >
                    自动填充
                  </Button>
                </Col>
                <Col span={1} offset={2}>
                  <Button
                    key='close'
                    onClick={this.handleClose}
                  >
                    取消
                  </Button>
                </Col>
                <Col span={2} offset={3}>
                  <Button
                    key='next'
                    type='primary'
                    htmlType='submit'
                    // onClick={() => this.handleNext()}
                  >
                    下一步
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
          {/* <Upload {...props}>
            <Button icon={<UploadOutlined />}>读取文件</Button>
          </Upload> */}
        </Modal>

        <Modal
          visible={this.state.secondModalVisible}
          title='接收方'
          width={750}
          // onOk={() => this.handleOK()}
          onCancel={this.handleClose}
          footer={[]}
        >
          <Form
            {...layout}
            // validateMessages={validateMessages}
            onFinish={this.handleOK}
            ref={this.formRef2}
          >
            <Form.Item
              label='MAC地址'
              labelAlign='left'
              name='desMAC'
              rules={[
                {
                  required: true,
                  message: '请输入接收方的MAC地址！'
                }
              ]}
            >
              <Input
                id='desMAC'
                style={{
                  textAlign: 'center',
                }}
                allowClear
                // maxLength={17}
                placeholder='请输入MAC地址（eg: AB-CD-EF-EF-CD-AB）'
                // onChange={this.handleMAC}
              />
            </Form.Item>

            <Form.Item
              label='IP地址'
              labelAlign='left'
              name='desIP'
              rules={[
                {
                  required: true,
                  message: '请输入接收方的IP地址！'
                }
              ]}
            >
              <Input
                id='desIP'
                // style={{
                //   textAlign: 'center',
                // }}
                allowClear
                // maxLength={17}
                placeholder='请输入IP地址（eg: 192.168.49.230）'
                // onChange={this.handleIP}
              />
            </Form.Item>

            <Form.Item
              label='端口号'
              labelAlign='left'
              name='desPort'
              rules={[
                {
                  required: true,
                  message: '请输入接收方的端口号！',
                }
              ]}
            >
              <Input
                id='desPort'
                type='number'
                min={0}
                max={65535}
                maxLength={5}
                style={{
                  width: '110px',
                }}
                placeholder='eg: 12344'
                // onChange={this.handlePort}
              />
            </Form.Item>
            
            <Form.Item>
              <Row wrap={false}>
                <Col span={2} offset={18}>
                  <Button
                    type='link'
                    key='close'
                    htmlType='button'
                    onClick={this.autoFill2}
                  >
                    自动填充
                  </Button>
                </Col>
                <Col span={1} offset={2}>
                  <Button
                    style={{width: '63.8px'}}
                    key='back'
                    onClick={this.handlePrevious}
                  >
                    返回
                  </Button>
                </Col>
                <Col span={2} offset={3}>
                  <Button
                    style={{width: '74px'}}
                    key='ok'
                    type='primary'
                    htmlType='submit'
                    // onClick={() => this.handleNext()}
                  >
                    完成
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Modal>     
      </>
    )
  }
}

// 概念介绍（Content, Carousel）
// css样式
const contentStyle = {
  height: '70vh',
  color: '#fff',
  //lineHeight: '60px',
  //textAlign: 'center',
  background: '#364d79',
};

const titleStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  textAlign: 'center',
  paddingTop: '1rem',
};

const paragraphStyle = {
  fontSize: '20px',
  marginTop: '1rem',
  marginLeft: '2rem',
  marginRight: '2rem',
  color: '#fff'
}
// 函数式组件
function Concepts(props) {
  return (
    <Carousel autoplay>
    <div>
      <Typography style={contentStyle}>
        <div style={titleStyle}>简介</div>
        <Paragraph style={paragraphStyle}>
          本演示程序通过输入相应的 MAC 地址、IP地址、端口号、数据，
          可以演示出数据在计算机网络 OSI 模型的每一层中进行的封包和解包过程以及各类表头结构的数据内容。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
            可以看到，映入眼帘的是一个跑马灯，这里对传输各层协议进行了一个简介。
            用户可以通过点击左上角“获取数据”按钮，来输入IP地址、MAC地址、端口号以及要传输的数据，然后可以通过动画进行学习。
            动画分为“流程演示”和“详细过程”，流程演示用于总体概览一个数据包传输的流程，
            详细过程可以查看每层数据包首部的具体内容。
        </Paragraph>
      </Typography>
    </div>
    <div>
      <Typography style={contentStyle}>
        <div style={titleStyle}>TCP</div>
        <Paragraph style={paragraphStyle}>
          传输控制协议（英语：Transmission Control Protocol，缩写：TCP）
          是一种面向连接的、可靠的、基于字节流的传输层通信协议，由 IETF 的 RFC 793 定义。
          在简化的计算机网络 OSI 模型中，它完成第四层传输层所指定的功能。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          TCP 协议的运行可划分为三个阶段：连接创建、数据传送和连接终止。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          TCP 用三次握手过程创建一个连接。
          在连接创建过程中，很多参数要被初始化，例如序号被初始化以保证按序传输和连接的强壮性。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          在 TCP 的数据传送过程中，很多重要的机制保证了 TCP 的可靠性和强壮性。
          包括：使用序号，对收到的 TCP 报文段进行排序以及检测重复的数据；
          使用校验和检测报文段的错误；使用确认和计时器来检测和纠正丢包或延时；
          流控制；拥塞控制；丢失包的重传。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          TCP 的连接终止使用了四次挥手过程，在这个过程中连接的每一侧都独立地被终止。
          当一个端点要停止它这一侧的连接，就向对侧发送 FIN，对侧回复 ACK 表示确认。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          TCP 数据包的表头在未配置选项的情况下长度为 20 字节。本演示过程中将展示 TCP 表头中各部分的内容。
        </Paragraph>
      </Typography>
    </div>
    <div>
      <Typography style={contentStyle}>
        <div style={titleStyle}>UDP</div>
        <Paragraph style={paragraphStyle}>
          用户数据报协议（英语：User Datagram Protocol，缩写：UDP；又称用户数据包协议）
          是一个简单的面向数据报的通信协议，位于 OSI 模型的传输层。
          该协议由 David P. Reed 在 1980 年设计且在 RFC 768 中被规范。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          在 TCP/IP 模型中，UDP 为网络层以上和应用层以下提供了一个简单的接口。
          UDP 只提供数据的不可靠传递，它一旦把应用程序发给网络层的数据发送出去，就不保留数据备份
          （所以UDP有时候也被认为是不可靠的数据报协议）。
          UDP 在 IP 数据报的头部仅仅加入了复用和数据校验字段。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          UDP 适用于不需要或在程序中执行错误检查和纠正的应用，它避免了协议栈中此类处理的开销。
          对时间有较高要求的应用程序通常使用 UDP，因为丢弃数据包比等待或重传导致延迟更可取。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          UDP 报头包括 4 个字段，每个字段占用 2 个字节，一共 8 字节。本演示过程中将展示 UDP 表头中各部分的内容。
        </Paragraph>
      </Typography>
    </div>
    <div>
      <Typography style={contentStyle}>
        <div style={titleStyle}>IP</div>
        <Paragraph style={paragraphStyle}>
          网际协议（英语：Internet Protocol，缩写：IP），又称互联网协议，是用于分组交换数据网络的协议。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          IP是在 TCP/IP 协议族中网络层的主要协议，任务仅仅是根据源主机和目的主机的地址来传送数据。
          为此目的，IP 定义了寻址方法和数据报的封装结构。
          第一个架构的主要版本为 IPv4，目前世界各地正在积极部署 IPv6。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          数据在IP互联网中传送时会封装为数据包。
          网际协议的独特之处在于：在报文交换网络中主机在传输数据之前，无须与先前未曾通信过的目的主机预先创建好特定的“通路”。
          互联网协议提供了“不可靠的”数据包传输机制（也称“尽力而为”或“尽最大努力交付”）；也就是说，它不保证数据能准确的传输。
          数据包在到达的时候可能已经损坏，顺序错乱（与其它一起传送的报文相比），产生冗余包，或者全部丢失。
          如果应用需要保证可靠性，一般需要采取其他的方法，例如利用 IP 的上层协议控制。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          IPv4 版本的 IP 表头在未配置选项的情况下长度为 20 字节。本演示过程中将展示 IPv4 表头中各部分的内容。
        </Paragraph>
      </Typography>
    </div>
    <div>
      <Typography style={contentStyle}>
        <div style={titleStyle}>Ethernet</div>
        <Paragraph style={paragraphStyle}>
          以太网（英语：Ethernet）是一种计算机局域网技术。
          IEEE 组织的 IEEE 802.3 标准制定了以太网的技术标准，它规定了包括物理层的连线、电子信号和介质访问控制的内容。
          以太网是目前应用最普遍的局域网技术，
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          以太网的标准拓扑结构为总线型拓扑，但目前的快速以太网（100BASE-T、1000BASE-T 标准）为了减少冲突，
          将能提高的网络速度和使用效率最大化，使用交换机来进行网络连接和组织。
          如此一来，以太网的拓扑结构就成了星型；
          但在逻辑上，以太网仍然使用总线型拓扑和 CSMA/CD（即载波多重访问/碰撞侦测）的总线技术。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          在以太网链路上的数据包称作以太帧。以太帧起始部分由前导码和帧开始符组成。
          后面紧跟着一个以太网报头，以MAC地址说明目的地址和源地址。
          帧的中部是该帧负载的包含其他协议报头的数据包(例如 IP 协议)。
          以太帧由一个 32 位冗余校验码结尾。它用于检验数据传输是否出现损坏。
        </Paragraph>
        <Paragraph style={paragraphStyle}>
          以太帧有很多种类型。不同类型的帧具有不同的格式和MTU值。但在同种物理媒体上都可同时存在。
          本演示过程采用 Ethernet II 的以太帧格式。
        </Paragraph>
      </Typography>
    </div>
  </Carousel>
  );
}

// 动画演示
// 单步动画
class StepMove extends React.Component {
  constructor(props) {
    super(props);
    this.showDataInfo = this.showDataInfo.bind(this);
    this.showTcpInfo = this.showTcpInfo.bind(this);
    this.showUdpInfo = this.showUdpInfo.bind(this);
    this.showIpInfo = this.showIpInfo.bind(this);
    this.showEthernetInfo = this.showEthernetInfo.bind(this);
    this.showPaddingInfo = this.showPaddingInfo.bind(this);
    this.state = {
      tcpSegment: [],
      tcpData: '',
      udpDatagram: [],
      udpData: '',
      ipPacket: [],
      ipData: '',
      ethernetFrame: [],
      ethernetData: '',
      showWhat: '',
      // dataShow: false,
      // tcpShow: false,
      // udpShow: false,
      // ipShow: false,
      // ethernetShow: false,
      // show: true,
      
    };
    
  }

  // handleStep() {
  //   let tcpOrUdp;
  //   const step = this.props.showStep;
  //   if (this.props.tcp_or_udp === 'tcp') {
  //     tcpOrUdp = true;
  //   }
  //   else if (this.props.tcp_or_udp === 'udp') {
  //     tcpOrUdp = false;
  //   }
  //   this.setState({
  //     tcpShow: tcpOrUdp && (step >= 1 && step <= 5) ? true : false,
  //     udpShow: !tcpOrUdp && (step >= 1 && step <= 5) ? true : false,
  //     ipShow: step >= 2 && step <= 4 ? true : false,
  //     ethernetShow: step === 3 ? true : false,
  //   });
  // }
  
  // 显示传输数据的相关信息
  showDataInfo() {
    this.setState({
      showWhat: 'data',
    })
  }

  // 显示TCP头的相关信息
  showTcpInfo() {
    let transportLayer = new TCPSegment(this.props.srcInfo.ip, this.props.srcInfo.port);
    let segment = transportLayer.encapsulateSegment(this.props.srcInfo.ip, this.props.srcInfo.port,
      this.props.desInfo.ip, this.props.desInfo.port, this.props.transferData, this.props.randomNum);
    let data = '';

    segment.forEach((element) => {
      data += element.binary;
    });

    this.setState({
      tcpSegment: segment,
      tcpData: data,
      showWhat: 'tcp',
    }, () => {});
  }

  // 显示UDP头的相关信息
  showUdpInfo() {
    let transportLayer = new UDPDatagram(this.props.srcInfo.ip, this.props.srcInfo.port);
    let datagram = transportLayer.encapsulateDatagram(this.props.srcInfo.ip, this.props.srcInfo.port,
      this.props.desInfo.ip, this.props.desInfo.port, this.props.transferData);
    let data = '';

    datagram.forEach((element) => {
      data += element.binary;
    });

    this.setState({
      udpDatagram: datagram,
      udpData: data,
      showWhat: 'udp',
    }, () => { });
  }

  // 显示IP头的相关信息
  showIpInfo() {
    let networkLayer = new IPv4Packet(this.props.srcInfo.ip);
    let packet = [];
    let data = '';

    if (this.props.tcp_or_udp) { // tcp
      packet = networkLayer.encapsulatePacket(this.props.srcInfo.ip, this.props.desInfo.ip, 
        this.state.tcpData, this.props.transferData);
    } else {
      packet = networkLayer.encapsulatePacket(this.props.srcInfo.ip, this.props.desInfo.ip, 
        this.state.udpData, this.props.transferData);
    }
    
    packet.forEach((element) => {
      data += element.binary;
    });

    this.setState({
      ipPacket: packet,
      ipData: data,
      showWhat: 'ip',
    }, () => {});
  }

  // 显示以太网头的相关信息
  showEthernetInfo() {
    let linkLayer = new EthernetFrame(this.props.srcInfo.mac);
    let frame = linkLayer.encapsulateFrame(this.props.srcInfo.mac, this.props.desInfo.mac,
      this.state.ipData, this.props.transferData);
    let data = '';

    frame.forEach((element) => {
      data += element.binary;
    });

    this.setState({
      ethernetFrame: frame,
      frameData: data,
      showWhat: 'ethernet'
    }, () => {});
  }

  // 显示填充字节相关信息
  showPaddingInfo() {
  }

  render() {
    let showTcpOrUdp;
    let tcpOrUdp;
    let content = '';
    if (this.props.tcp_or_udp === 'tcp') {
      tcpOrUdp = true;
    }
    else if (this.props.tcp_or_udp === 'udp') {
      tcpOrUdp = false;
    }
    else {
      message.error('tcp和udp选择错误！');
      return (<div>错了</div>);
    }
    if (tcpOrUdp) {
      showTcpOrUdp =
        <Col span={3} offset={0}>
          <QueueAnim
            delay={500}
            type='left'
          >
            {
              this.props.tcpShow ?
              <div key='tcp'>
                <Card
                  style={{
                    height: 70,
                    // borderRadius: 7,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    fontSize: 20,
                    textAlign: 'center',
                  }}
                  hoverable
                  onClick={this.showTcpInfo}
                >
                  <div style={{marginTop:-15, color: 'white'}}>
                    {this.props.tcp_or_udp.toUpperCase()}
                    <br/>
                    <span style={{fontSize: 14, marginTop: -10,}}>
                      length:20Bytes
                    </span>
                  </div>
                </Card>
              </div> : null
            }
          </QueueAnim>
        </Col>
    }
    else {
      showTcpOrUdp =
        <Col span={3} offset={0}>
          <QueueAnim
            delay={500}
            type='left'
          >
            {
              this.props.udpShow ?
              <div key='udp'>
                <Card
                  style={{
                    height: 70,
                    // borderRadius: 10,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    fontSize: 20,
                    textAlign: 'center',
                  }}
                  hoverable
                  onClick={this.showUdpInfo}
                >
                  <div style={{marginTop:-15, color: 'white'}}>
                    {this.props.tcp_or_udp.toUpperCase()}
                    <br/>
                    <span style={{fontSize: 14, marginTop: -10,}}>
                      length:8Bytes
                    </span>
                  </div>
                </Card>
              </div> : null
            }
          </QueueAnim>
        </Col>
    }

    // 文字提示
    if (this.props.showStep > 3 && this.props.showStep < 6) {
      content =
        <div
        style={{
          marginTop: 35,
          fontSize: 20,
          fontWeight: 'bold',
          }}
        >
          接收（拆包）
        </div>
    }
    else if(this.props.showStep <= 3 && this.props.showStep > 0) {
      content =
        <div
        style={{
          marginTop: 35,
          fontSize: 20,
          fontWeight: 'bold',
        }}
        >
          发送（封包）
        </div>
    }
    else if (this.props.showStep === 0) {
      content =
        <div
        style={{
          marginTop: 35,
          fontSize: 20,
          fontWeight: 'bold',
          }}
        >
          就绪（准备发送）
        </div>
    }
    else if (this.props.showStep === 6) {
      content =
        <div
        style={{
          marginTop: 35,
          fontSize: 20,
          fontWeight: 'bold',
          }}
        >
          完成（成功接收）
        </div>
    }
    

    ////////////////////////////////////////////////////
    let detailInfo;
    if (this.state.showWhat === 'data') {
      detailInfo =
      <>
        <Row wrap={false} style={{marginTop: 25,}}>
          <Col span={16} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                数据:"{this.props.transferData}"
              </div>
            </Card>
          </Col>
        </Row>
        
      </>
    }
    else if (this.state.showWhat === 'tcp') {
      detailInfo =
      <>
        <Row wrap={false} style={{marginTop: 25,}}>
          <Col span={8} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                源端口号:{this.state.tcpSegment[0].value}
              </div>
            </Card>
          </Col>

          <Col span={8} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                源端口号:{this.state.tcpSegment[1].value}
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={16} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                序列号:{this.state.tcpSegment[2].value}
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={16} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                应答号:{this.state.tcpSegment[3].value}
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={3} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                偏移:{this.state.tcpSegment[4].value}*4Bytes
              </div>
            </Card>
          </Col>

          <Col span={1} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                0
              </div>
            </Card>
          </Col>

          <Col span={4} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                控制位:0
              </div>
            </Card>
          </Col>

          <Col span={8} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                窗口大小:{this.state.tcpSegment[7].value}Bytes
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={8} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                校验和:{this.state.tcpSegment[8].value}
              </div>
            </Card>
          </Col>

          <Col span={8} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                紧急指针:{this.state.tcpSegment[9].value}
              </div>
            </Card>
          </Col>
        </Row>
      </>
    }
    else if (this.state.showWhat === 'udp') {
      detailInfo =
      <>
        <Row wrap={false} style={{marginTop: 25,}}>
          <Col span={8} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                源端口号:{this.state.udpDatagram[0].value}
              </div>
            </Card>
          </Col>

          <Col span={8} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                目标端口号:{this.state.udpDatagram[1].value}
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={8} offset={4}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                包长度:{this.state.udpDatagram[2].value}Bytes
              </div>
            </Card>
          </Col>

          <Col span={8} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                校验和:{this.state.udpDatagram[3].value}
              </div>
            </Card>
          </Col>
        </Row>
      </>
    }
    else if (this.state.showWhat === 'ip') {
      detailInfo =
      <>
        <Row wrap={false} style={{marginTop: 25,}}>
          
          <Col span={3} offset={2}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 14,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                版本:{this.state.ipPacket[0].value}
              </div>
            </Card>
          </Col>

          <Col span={4} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 8,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                首部:{this.state.ipPacket[1].value}*4Bytes
              </div>
            </Card>
          </Col>

          <Col span={2} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                DSCP:{this.state.ipPacket[2].value}
              </div>
            </Card>
          </Col>

          <Col span={1} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                00
              </div>
            </Card>
          </Col>

          <Col span={10} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                总长度:{this.state.ipPacket[4].value}Bytes
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          
          <Col span={10} offset={2}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                标识:{this.state.ipPacket[5].value}
              </div>
            </Card>
          </Col>

          <Col span={2} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                010
              </div>
            </Card>
          </Col>

          <Col span={8} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                片偏移:{this.state.ipPacket[7].value}*8Bytes
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          
          <Col span={5} offset={2}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                生存时间:{this.state.ipPacket[8].value}
              </div>
            </Card>
          </Col>

          <Col span={5} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                协议:{this.state.ipPacket[9].value}({this.props.tcp_or_udp})
              </div>
            </Card>
          </Col>

          <Col span={10} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                首部校验和:{this.state.ipPacket[10].value}
              </div>
            </Card>
          </Col>
        
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={20} offset={2}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                源地址:{this.state.ipPacket[11].value}
              </div>
            </Card>
          </Col>
        </Row>

        <Row wrap={false} style={{marginTop: 1,}}>
          <Col span={20} offset={2}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                目标地址:{this.state.ipPacket[12].value}
              </div>
            </Card>
          </Col>
        </Row>
      </>

    }
    else if (this.state.showWhat === 'ethernet') {
      detailInfo =
      <>
        <Row wrap={false} style={{marginTop: 25,}}>
          <Col span={5} offset={1}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 8,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                目标MAC:{this.state.ethernetFrame[2].value}
              </div>
            </Card>
          </Col>

          <Col span={5} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 8,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                源MAC:{this.state.ethernetFrame[3].value}
              </div>
            </Card>
          </Col>

          <Col span={3} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 8,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                类型:{this.state.ethernetFrame[4].value}
              </div>
            </Card>
          </Col>

          <Col span={6} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 15,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                数据:{this.state.ethernetFrame[5].length / 8}Bytes
              </div>
            </Card>
          </Col>

          <Col span={3} offset={0}>
            <Card
              style={{
                height: 40,
                // backgroundColor: 'gray',
                // fontWeight: 'bold',
                textAlign: 'center',
                fontSize: 14,
                borderWidth: 'medium',
                borderColor: 'black'
              }}
              hoverable
              // onClick={this.showUdpInfo}
            >
              <div style={{ marginTop: -16, color: 'black' }}>
                FCS:{this.state.ethernetFrame[this.props.paddingShow ? 7 : 6].value}
              </div>
            </Card>
          </Col>
        </Row>
        
      </>
    }

    ////////////////////////////////////////////////////
    return (
      <>
        {content}
          <Row wrap={false} style={{ marginTop: 20, }}>
  
          <Col span={3} offset={4}>
            <QueueAnim
              delay={500}
              type='left'
            >
              {
                this.props.ethernetShow ?
                <div key='ethernet'>
                  <Card
                    style={{
                      // width: 100,
                      height: 70,
                      // borderRadius: 7,
                      backgroundColor: '#27296d',
                      fontWeight: 'bolder',
                      fontSize: 20,
                      textAlign: 'center'
                    }}
                    hoverable
                    onClick={this.showEthernetInfo}
                  >
                    <div style={{marginTop:-15, color: 'white'}}>
                      Ethernet
                      <br/>
                      <span style={{fontSize: 14, marginTop: -10,}}>
                        length:14Bytes
                      </span>     
                    </div>
                  </Card>
                </div> : null
              }
            </QueueAnim>
          </Col>
          
          <Col span={3} offset={0}>
            <QueueAnim
              delay={500}
              type='left'
            >
              {
                this.props.ipShow ?
                <div key='ip'>
                  <Card
                    style={{
                      // width: 300,
                      height: 70,
                      // borderRadius: 7,
                      backgroundColor: '#5e63b6',
                      fontWeight: 'bolder',
                      fontSize: 20,
                      textAlign: 'center'
                    }}
                    hoverable
                    onClick={this.showIpInfo}
                  >
                    <div style={{marginTop:-15, color: 'white'}}>
                      IP
                      <br/>
                      <span style={{fontSize: 14, marginTop: -10,}}>
                        length:20Bytes
                      </span>
                    </div>
                  </Card>
                </div> : null
              }
            </QueueAnim>
          </Col>

          {showTcpOrUdp}

          <Col span={6} offset={0}>
            <QueueAnim
              delay={500}
              type='left'
            >
              {
                this.props.dataShow ?
                <div key='data'>
                  <Card
                    style={{
                      // width: 300,
                      height: 70,
                      // borderRadius: 7,
                      backgroundColor: '#f5c7f7',
                      fontWeight: 'bolder',
                      fontSize: 20,
                      textAlign: 'center'
                      
                    }}
                    hoverable
                    onClick={this.showDataInfo}
                  >
                    <div style={{marginTop:-15, color: 'white'}}>
                        DATA
                        <br/>
                        <span style={{fontSize: 14, marginTop: -10,}}>
                          length: {this.props.transferData.length}Bytes
                        </span>
                    </div>
                  </Card>
                </div> : null
              }
            </QueueAnim>
          </Col>

          <Col span={1} offset={0}>
            <QueueAnim
              delay={500}
              type='right'
            >
              {
                this.props.paddingShow ?
                <div key='padding'>
                  <Popover content={this.props.paddingInfo} title="填充字节">
                    <Card
                      style={{
                        // width: 100,
                        height: 70,
                        // borderRadius: 7,
                        backgroundColor: '#27296d',
                        
                      }}
                      hoverable
                      onClick={this.showPaddingInfo}
                    >
                    </Card>  
                  </Popover>
                </div> : null
              }
            </QueueAnim>
          </Col>
          
        </Row>
        {detailInfo}
      </>
    );
  }
}

// 连续动画
class ContinuousMove extends React.Component {
  render() {
    return (
      <>
        <Row wrap={false} style={{ marginTop: 10, }}>
          <Col span={2} offset={5}>
            <div key='send'>
              <Card
                style={{
                  height: 50,
                  // borderRadius: 10,
                  backgroundColor: 'white',
                  fontWeight: 'bolder',
                  textAlign: 'center',
                  fontSize: 16,
                }}
                bordered={false}
                hoverable
                // onClick={this.showUdpInfo}
              >
                <div style={{marginTop: -13}}>
                  发送方
                </div>
                {/* {this.props.tcp_or_udp} */}
              </Card>
            </div>
          </Col>

          <Col span={2} offset={9}>
            <div key='recv'>
              <Card
                style={{
                  height: 50,
                  // borderRadius: 10,
                  backgroundColor: 'white',
                  fontWeight: 'bolder',
                  textAlign: 'center',
                  fontSize: 16,
                }}
                bordered={false}
                hoverable
                // onClick={this.showUdpInfo}
              >
                <div style={{marginTop: -13}}>
                  接收方
                </div>
                {/* {this.props.tcp_or_udp} */}
              </Card>
            </div>
          </Col>
          
        </Row>
        
        <Row wrap={false} style={{ marginTop: 20, }}>
          <Col span={2} offset={0}>
            <QueueAnim
              delay={0 * delayTime}
              type='top'
            >
              <div key='layer-1'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: 'white',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                  bordered={false}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13}}>
                    应用层
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={3} offset={6}>
            <QueueAnim
              delay={0 * delayTime}
              type='top'
            >
              <div key='send-1'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>
            
          <Col span={3} offset={8}>
            <QueueAnim
              delay={8 * delayTime}
              type='bottom'
            >
              <div key='recv-1'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>
        </Row>

        <Row wrap={false} style={{ marginTop: 20, }}>
          <Col span={2} offset={0}>
            <QueueAnim
              delay={1 * delayTime}
              type='top'
            >
              <div key='layer-2'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: 'white',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                  bordered={false}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13}}>
                    传输层
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={4}>
            <QueueAnim
              delay={1 * delayTime}
              type='top'
            >
              <div key='send-2-1'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    {this.props.tcp_or_udp.toUpperCase()}
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={3} offset={0}>
            <QueueAnim
              delay={1 * delayTime}
              type='top'
            >
              <div key='send-2-2'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={6}>
            <QueueAnim
              delay={7 * delayTime}
              type='bottom'
            >
              <div key='recv-2-1'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    {this.props.tcp_or_udp.toUpperCase()}
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>
            
          <Col span={3} offset={0}>
            <QueueAnim
              delay={7 * delayTime}
              type='bottom'
            >
              <div key='recv-2-2'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>
        </Row>

        <Row wrap={false} style={{ marginTop: 20, }}>
          <Col span={2} offset={0}>
            <QueueAnim
              delay={2 * delayTime}
              type='top'
            >
              <div key='layer-3'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: 'white',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                  bordered={false}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13}}>
                    网络层
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={2}>
            <QueueAnim
              delay={2 * delayTime}
              type='top'
            >
              <div key='send-3-1'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#5e63b6',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white'}}>
                    IP
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={2 * delayTime}
              type='top'
            >
              <div key='send-3-2'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white'}}>
                    {this.props.tcp_or_udp.toUpperCase()}
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={3} offset={0}>
            <QueueAnim
              delay={2 * delayTime}
              type='top'
            >
              <div key='send-3-3'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white'}}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={4}>
            <QueueAnim
              delay={6 * delayTime}
              type='bottom'
            >
              <div key='recv-3-1'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#5e63b6',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    IP
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={6 * delayTime}
              type='bottom'
            >
              <div key='recv-3-2'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    {this.props.tcp_or_udp.toUpperCase()}
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>
            
          <Col span={3} offset={0}>
            <QueueAnim
              delay={6 * delayTime}
              type='bottom'
            >
              <div key='recv-3-3'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>
        </Row>

        <Row wrap={false} style={{ marginTop: 20, }}>
          <Col span={2} offset={0}>
            <QueueAnim
              delay={3 * delayTime}
              type='top'
            >
              <div key='layer-4'>
                <Card
                  style={{
                    height: 50,
                    // borderRadius: 10,
                    backgroundColor: 'white',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                  bordered={false}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -17}}>
                    网络接口层
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={3 * delayTime}
              type='top'
            >
              <div key='send-4-1'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#27296d',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    ETH
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={3 * delayTime}
              type='top'
            >
              <div key='send-4-2'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#5e63b6',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    IP
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={3 * delayTime}
              type='top'
            >
              <div key='send-4-3'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    {this.props.tcp_or_udp.toUpperCase()}
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={3} offset={0}>
            <QueueAnim
              delay={3 * delayTime}
              type='top'
            >
              <div key='send-4-4'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={2}>
            <QueueAnim
              delay={5 * delayTime}
              type='bottom'
            >
              <div key='recv-4-1'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#27296d',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    ETH
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={5 * delayTime}
              type='bottom'
            >
              <div key='recv-4-2'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#5e63b6',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    IP
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>

          <Col span={2} offset={0}>
            <QueueAnim
              delay={5 * delayTime}
              type='bottom'
            >
              <div key='recv-4-3'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#a393eb',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    {this.props.tcp_or_udp.toUpperCase()}
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>
            
          <Col span={3} offset={0}>
            <QueueAnim
              delay={5 * delayTime}
              type='bottom'
            >
              <div key='recv-4-4'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: '#F5C7F7',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{marginTop: -13, color: 'white', }}>
                    DATA
                  </div>
                  {/* {this.props.tcp_or_udp} */}
                </Card>
              </div>
            </QueueAnim>
          </Col>
        </Row>
        
        <Row wrap={false} style={{ marginTop: 20, }}>
          <Col offset={2} span={20}>
            <QueueAnim
              delay={4 * delayTime}
              type='scaleX'
            >
              <div key='switch'>
                <Card
                  style={{
                    height: 50,
                    backgroundColor: 'gray',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                  hoverable
                  // onClick={this.showUdpInfo}
                >
                  <div style={{ marginTop: -13, color: 'white' }}>
                    以太网线/交换机
                  </div>
                </Card>
              </div>
            </QueueAnim>
          </Col>
        </Row>
      </>
    );
  }
}

// 动画总体控制
class Move extends React.Component {
  constructor(props) {
    super(props);
    this.changeMoveMode = this.changeMoveMode.bind(this);
    this.chooseProtocol = this.chooseProtocol.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.preStep = this.preStep.bind(this);
    this.handleStep = this.handleStep.bind(this);
    this.reset = this.reset.bind(this);
    this.state = {
      oneStepButton: false,
      continuousButton: true,
      tcp_or_udp: 'tcp',
      showStep: 0,
      dataShow: true,
      tcpShow: false,
      udpShow: false,
      ipShow: false,
      ethernetShow: false,
      paddingShow: false,
      paddingInfo: '',
    }
  }

  // 标签页切换：流程演示or详细过程
  changeMoveMode(key) {
    // console.log(key);
    if (key === 'oneStep') {
      this.setState({
        oneStepButton: true,
        continuousButton: false,
      })
    }
    else if (key === 'continuous') {
      this.setState({
        oneStepButton: false,
        continuousButton: true,
        showStep: 0,
      });
    }
    else {
      message.error('changeMoveMode函数参数有误！');
    }
    // console.log(this.state);
  }

  // 选择是tcp还是udp
  // setstate的特性：不保证同步（想要的数据始终慢我一步，解决方法为在回调函数中访问或直接传给子组件）
  chooseProtocol(e) {
    this.setState({
      tcp_or_udp: e.target.value,
    });
    console.log('传进来的: ', e.target.value);
    console.log('state: ', this.state.tcp_or_udp);
  }

  // 以一个showStep变量来标识当前是进行到哪一步了
  handleStep() {
    let tcpOrUdp;
    if (this.state.tcp_or_udp === 'tcp') {
      tcpOrUdp = true;
    }
    else if (this.state.tcp_or_udp === 'udp') {
      tcpOrUdp = false;
    }

    let paddingLength;
    if (tcpOrUdp) {
      paddingLength = 60 - (54 + this.props.transferData.length);
    }
    else {
      paddingLength = 60 - (42 + this.props.transferData.length);
    }

    this.setState({
      tcpShow: tcpOrUdp && (this.state.showStep >= 1 && this.state.showStep <= 5) ? true : false,
      udpShow: !tcpOrUdp && (this.state.showStep >= 1 && this.state.showStep <= 5) ? true : false,
      ipShow: this.state.showStep >= 2 && this.state.showStep <= 4 ? true : false,
      ethernetShow: this.state.showStep === 3 ? true : false,
      paddingShow: this.state.showStep === 3 && paddingLength > 0 ? true : false,
      paddingInfo: paddingLength > 0 ? ('Padding: 0, Length: ' + paddingLength + ' Bytes') : ''
    });
    console.log('showStep: ', this.state.showStep);
  }

  // 单步演示时的下一步
  nextStep() {
    let curStep = this.state.showStep;
    curStep = curStep >= 6 ? curStep : curStep + 1;
    this.setState({
      showStep: curStep,
    }, this.handleStep);
  }

  // 单步演示时的上一步
  preStep() {
    let curStep = this.state.showStep;
    curStep = curStep <= 0 ? curStep : curStep - 1;
    this.setState({
      showStep: curStep,
    }, this.handleStep);
  }

  // 单步演示时的重置
  reset() {
    this.setState({
      showStep: 0,
    }, this.handleStep);
  }

  render() {
    console.log(this.state.showStep);
    return (
      <>
        <PageHeader
          className='site-page-header-responsive'
          onBack={this.props.onClickBack}
          title="动画演示"
          // subTitle="This is a subtitle"
          extra={[
            <Radio.Group
              onChange={this.chooseProtocol}
              defaultValue='tcp'
              key='radio'
              disabled={this.state.showStep !== 0}
            >
              <Radio value='tcp' key='TCP'>
                TCP
              </Radio>
              <Radio value='udp' key='UDP'>
                UDP
              </Radio>
            </Radio.Group>,
            <Button
              key='pre'
              onClick={this.preStep}
              disabled={!this.state.oneStepButton || this.state.showStep === 0}
            >
              上一步
            </Button>,
            <Button
              key='next'
              onClick={this.nextStep}
              disabled={!this.state.oneStepButton || this.state.showStep === 6}
            >
              下一步
            </Button>,
            <Button
              key='reset'
              onClick={this.reset}
              disabled={!this.state.oneStepButton}
            >
              重置
            </Button>,
            // <Button
            //   key='begin'
            //   type='primary'
            //   disabled={!this.state.continuousButton}
            // >
            //   开始演示
            // </Button>,
          ]}
          footer={
            <Tabs
              defaultActiveKey='1'
              size='large'
              onChange={this.changeMoveMode}
            >
              <TabPane
                tab='流程演示'
                key='continuous'
              >
                <ContinuousMove
                  tcp_or_udp={this.state.tcp_or_udp}
                  srcInfo={this.props.srcInfo}
                  desInfo={this.props.desInfo}
                />
              </TabPane>

              <TabPane
                tab='详细过程'
                key='oneStep'
              >
                <StepMove
                  showStep={this.state.showStep}
                  tcp_or_udp={this.state.tcp_or_udp}
                  srcInfo={this.props.srcInfo}
                  desInfo={this.props.desInfo}
                  transferData={this.props.transferData}
                  dataShow={this.state.dataShow}
                  tcpShow={this.state.tcpShow}
                  udpShow={this.state.udpShow}
                  ipShow={this.state.ipShow}
                  ethernetShow={this.state.ethernetShow}
                  paddingShow={this.state.paddingShow}
                  paddingInfo={this.state.paddingInfo}
                  randomNum={this.props.randomNum}
                />
              </TabPane> 
              
              

            </Tabs>
          }
        >
        </PageHeader>
      </>
    );
  }
}

// 总体页面组件（可以理解为根组件）
class App extends React.Component {
  constructor(props) {
    super(props);
    this.getMAC = this.getMAC.bind(this);
    this.getIP = this.getIP.bind(this);
    this.getPort = this.getPort.bind(this);
    this.getData = this.getData.bind(this);
    this.setSrcInfo = this.setSrcInfo.bind(this);
    this.setDesInfo = this.setDesInfo.bind(this);
    this.checkInfo = this.checkInfo.bind(this);
    this.randomSeq = this.randomSeq.bind(this);
    this.state = {
      showConcepts: true,       // 内容部分是显示概念介绍走马灯还是动画演示
      srcInfo: {},              // 发送端的信息（MAC，IP，端口号）
      desInfo: {},              // 接收端的信息（MAC，IP，端口号）
      srcIsCorrect: false,      // 发送端信息检查结果
      desIsCorrect: false,      // 接收端信息检查结果
      transferData: '',         // 要传输的数据
      randomNum: -1,
    };
    this.tempSrcMAC = '';
    this.tempSrcIP = '';
    this.tempSrcPort = '';
    this.tempData = '';
    this.tempDesMAC = '';
    this.tempDesIP = '';
    this.tempDesPort = '';
    // this.randomNum = -1;
  }

  // 切换页面显示内容：文件简介走马灯or发包拆包演示
  changeContent(islegal) {
    this.setState({ showConcepts: !islegal });
    console.log('showConcepts', this.state.showConcepts);
  }

  // 获取输入的MAC地址
  getMAC(value, id) {
    if (id === 'srcMAC') {
      this.tempSrcMAC = value;
    }
    else if (id === 'desMAC') {
      this.tempDesMAC = value;
    }
    else {
      console.log('id: ', id)
      console.log('value: ', value);
      message.error('MAC input error', 2);
    }
  }

  // 获取输入的IP地址
  getIP(value, id) {
    if (id === 'srcIP') {
      this.tempSrcIP = value;
    }
    else if (id === 'desIP') {
      this.tempDesIP = value;
    }
    else {
      message.error('IP input error', 2);
    }
  }

  // 获取输入的端口号
  getPort(value, id) {
    if (id === 'srcPort') {
      this.tempSrcPort = parseInt(value);
    }
    else if (id === 'desPort') {
      this.tempDesPort = parseInt(value);
    }
    else {
      message.error('Port input error', 2);
    }
  }

  // 获取输入的MAC地址
  getData(value) {
    this.tempData = value;
  }

  // 根据获取到的相关数据设置发送方的信息
  setSrcInfo() {
    // console.log('MAC*'+this.tempSrcMAC+'*');
    // console.log('IP', this.tempSrcIP);
    // console.log('Port', this.tempSrcPort);
    // console.log('Data', this.tempData);
    this.setState({
      srcInfo: new FormInfo(this.tempSrcMAC, this.tempSrcIP, this.tempSrcPort),
      transferData: this.tempData,
    });
  }

  // 根据获取到的相关数据设置接收方的信息
  setDesInfo() {
    // console.log('MAC', this.tempDesMAC);
    // console.log('IP', this.tempDesIP);
    // console.log('Port', this.tempDesPort);

    this.setState({
      desInfo: new FormInfo(this.tempDesMAC, this.tempDesIP, this.tempDesPort),
    });
  }

  // 产生一个随机的SEQ序列号
  randomSeq() {
    const getRandom = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.setState({
      randomNum: getRandom(0, 2 ** 32),
    });
    // this.randomNum = getRandom(0, 2 ** 32);
  }

  // 对表单信息进行检查
  checkInfo(curForm) {
    console.log(this.state.srcInfo);
    console.log(this.state.desInfo);
    let errorArr = [];
    if (curForm === 1) {
      errorArr =  this.state.srcInfo.check();
    }
    else if (curForm === 2) {
      errorArr = this.state.desInfo.check();
      this.changeContent(!errorArr.length);
    }
    else {
      message.error('checkInfo参数有误！');
    }
    // console.log(errorArr);
    return errorArr;
  }

  render() {
    let content;
    if (this.state.showConcepts) {
      content = <Concepts/>
    }
    else {
      content =
        <Move
          onClickBack={() => this.changeContent(false)}
          srcInfo={this.state.srcInfo}
          desInfo={this.state.desInfo}
          transferData={this.state.transferData}
          randomNum = {this.state.randomNum}
        />
    }
    return (
      <Layout className="layout">
        <Header>
          <Row>
            <Col span={6} offset={9}>
              <Title title="数据包的多层传输演示" />
            </Col>
            <Col span={3} offset={5}>
              <DataInput
                getMAC={this.getMAC}
                getIP={this.getIP}
                getPort={this.getPort}
                getData={this.getData}
                setSrcInfo={this.setSrcInfo}
                setDesInfo={this.setDesInfo}
                checkInfo={this.checkInfo}
                randomSeq={this.randomSeq}
                
              />
            </Col>
          </Row>
        </Header>
        <Content style={{
          paddingLeft: '50px',
          paddingRight: '50px',
          paddingBottom: '0px',
          paddingTop: '20px',
          height: '615px',
        }}>
          <div className="site-layout-content">{content}</div>
        </Content>
        <Footer>
          <DeveloperInfo
            info="1851381 赵中楷 1851726 汪一泓 1854135 魏洪杰 1851294 邢皓炀"
            contact="kanezz620@gmail.com"
          />
        </Footer>
      </Layout>
    );
  }
}

export default App;
