// 在ES6中我们为了使用某个对象中的方法以及属性方便我们可以解构对象
// 一般解构库中的属性方法，我们不要再修改他们，所以通常定义成常量更安全
//通过const定义常量
const{Component}=React;
const{render}=ReactDOM;
// 定义头部组件
class Header extends Component {
  goPre(){
    window.history.go()
    // console.log(window.history.go())
  }
  render() {
    return (
      <div className="header">
        <div className="arrow" onClick={this.goPre}><span></span><span className="blue"></span></div>
        <div className="login">登录</div>
        <h1>体育新闻网</h1>
      </div>
    )
  }
}
//定义各个子组件
class Home extends Component{
  //定义getId的方法
  getId(id){
      console.log(id);
      //使用getProductId来接受传递的id
      this.props.getProductId(id)
  }
	creatList(){
		//遍历属性数据渲染列表
		return this.props.data.map((value,index)=>{
			return(
        <li key={index} onClick={this.getId.bind(this,value.id)}>
           <img src={value.img} alt="" />
           <div className="intro">
             <h2>{value.title}</h2>
             <p>{value.content}<span className="comment-num">{'评论：' + value.comment}</span></p>
           </div>
         </li>
        )
		})
	}
	render(){
		return(
			<section className='home' style={{display:this.props.page=='home' ? 'block' : 'none'}}>
                 <ul>{this.creatList()}</ul>
			</section>
             
			)
	}
}
class Product extends Component{
  getId(id){
    console.log(id)
    this.props.getCommentId(id)
  }
	render(){
    //缓存数据
    let data=this.props.stateData;
    let content={
      __html:data.content
    }

		return(
          <section className='detail' style={{display:this.props.page=='product'? 'block' : 'none'}}>
               <h1>{data.title}</h1>
               <p><span>{data.time}</span><span className="comment-num">{'评论:'+data.comment}</span></p>
               <img src={data.img} alt=""/>
             {/*因为是特殊标签所以有特殊属性dangerouslySetInnerHTML*/}
               <p dangerouslySetInnerHTML={content}></p>
               <p className='btn' onClick={this.getId.bind(this,data.id)}>查看更多评论</p>
          </section>
             
			)
	}
}
class Comments extends Component{
  constructor(props) {
    super(props)
    // 将属性数据转化成状态数据
    // 这里的赋值相当于创建期
    this.state = {
      list: props.stateCommentData.list
    }
  }
  // 存在期不会执行构造函数了，所以我们要在存在期更新状态
  componentWillReceiveProps(props) {
    // console.log(props)
    this.setState({
      list: props.stateCommentData.list
    })
  }
  // 渲染列表
  createList() {
    return this.props.stateCommentData.list.map((value, index) => {
      return (
        <li key={index}>
          <h3>{value.user}</h3>
          <p>{value.content}</p>
          <span>{value.time}</span>
        </li>
      )
    })
  }
  //设置addComment事件
  addComment(){
    //获取textarea的val值
    //需要用bind帮定作用域
    let dom=this.refs.textVal;
    let val=dom.value;
    console.log(val)
    //对得到的数据做处理进行正则验证
    if(/^\s*$/.test(val)){
      alert('请输入内容');
      return
    }
    //创建提交的数据
    let date=new Date();
    let data={
      user:'遥遥天际',
      content:val,
      time:'刚刚'+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    }
    // 数据提交给服务器
    let url = 'data/addComment.json' + Until.objToQuery(data);
    //Until发出ajax请求数据
    Until.myajax(url,(res)=>{
      if(res && res.errno==0){
       let list=this.state.list;
       list.push(data);
       //进行更改状态
       this.setState({
         list:list
       })
       //追加以后进行清空textare
       dom.value=''
      }
    })
  }
	render(){
		return(
         <section className='comments' style={{display:this.props.page==='comments' ? 'block' : 'none'}}>
             <div className="container">
             <textarea ref="textVal" placeholder="文明上网，理性发言！"></textarea>
             <div className="submit" onClick={this.addComment.bind(this)}><span>发布</span></div>
             <ul>{this.createList()}</ul>
        </div>
         </section>
              
			)
	}
}
//定义一个公共方法
let Until={
    myajax(url,fn){
       let xhr= window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
       xhr.onreadystatechange=()=>{
       	if(xhr.readyState===4){
       		if(xhr.status===200){
       			fn &&fn(JSON.parse(xhr.responseText))
       		}
       	}
       }
       xhr.open('GET',url,true);
       xhr.send(null)
    },
    /**
   * 将对象转化成query的形式
   * @obj   转化的对象 {color:red, num:100}
   * return   ?color=red&num=100
   **/
  objToQuery(obj) {
    let result = '';
    // 遍历对象，转化成json
    for (var i in obj) {
      result += '&' + i + '=' + obj[i]
    }
    // 去除最后一个&
    return '?' + result.slice(1)
  }
}
//通过继承创建组件
class App extends Component {
	//在类中定义默认状态只能定义在构造函数内
	constructor(props){
		var hash=location.hash.replace(/\#\/(\w+)/g,function(match,$1){
			return $1
		})
		console.log(hash)
     super(props)
     //通过state定义初始化状态
     this.state={
     	page:props.page,
     	home:[],
       detail:{},
       comment:{
         list:[]
       }
     }
	}
  //定义showProduct
  showProduct(id){
       //使用ajx方法请求数据
       Until.myajax('data/detail.json?id'+id,(res)=>{
         //使用箭头函数作用域就是箭头函数创建时的此作用域
         console.log(this)
         if(res && res.errno===0){
             this.setState({
               detail:res.data,
               page:'product'
             })
         }
       })
  }
  //定义showComment
  showComment(id){
      //根据请求回来的数据在comment
      Until.myajax('data/comment.json?id='+id,res=>{
        if(res && res.errno==0){
          this.setState({
            comment:res.data,
            page:'comments'
          })
        }
      })
  }
     render(){
     	return (
     		<div>
     	     {/*定义子组件*/}
              <Header></Header>
               <Home page={this.state.page} data={this.state.home} getProductId={this.showProduct.bind(this)}></Home>
             {/*给Product组件传递数据*/}
               <Product page={this.state.page} stateData={this.state.detail} getCommentId={this.showComment.bind(this)}></Product>
               <Comments page={this.state.page} stateCommentData={this.state.comment}></Comments>
     		</div>
             
     		)
     }
     componentDidMount(){
     	//调用ajax请求数据
     	Until.myajax('data/list.json',(res)=>{
     		if(res && res.errno==0){
     			console.log(res.data)
     			this.setState({
     				home:res.data
     			})
     		}
     	})
     }
}
//通过render进行渲染到页面中
render(<App page='home'></App>,document.getElementById('app'));