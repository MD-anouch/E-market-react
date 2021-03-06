import React, { Component } from 'react'
import {storeProducts, detailProduct} from './data'

const ProductContext = React.createContext()
//Provider
//Consumer

class ProductProvider extends Component {

    constructor(props){
        super(props)

        this.state = {
            product: [],
            productData: [],
            detailProduct: detailProduct,
            cart:[],
            modalOpen: false,
            modalProduct:detailProduct,
            cartSubTotal: 0,
            cartTax: 0,
            cartTotal: 0,
            isLoading: true,
            _isMounted:false

        }
        this.getItem = this.getItem.bind(this)
        this.handelDetail = this.handelDetail.bind(this)
        this.addToCart = this.addToCart.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.increment = this.increment.bind(this)
        this.decrement = this.decrement.bind(this)
        this.removeItem = this.removeItem.bind(this)
        this.clearCart = this.clearCart.bind(this)
        this.addTotal = this.addTotal.bind(this)
        this.dataRefresh = this.dataRefresh.bind(this)
        this.componentDidMount = this.componentDidMount.bind(this)

    }


    componentDidMount(){

        // the database method
        this.setState({
            _isMounted:true
        },()=>{
            this.getData()
        })


        // the normal data method
        // this.setProducts()
        // console.log(this.state.product)
    }

    getData(){
        axios.get('http://127.0.0.1:8000/product')
        .then(res => {
            if (this.state._isMounted) {
                this.setState({
                    isLoading: false,
                    productData:res.data,
                },()=>{
                    // this.dataRefresh()
                    this.setProducts()
                    console.log(this.state.productData)
                })
              }

        })
        .catch(err => {
            console.error(err);
        })
    }

    dataRefresh(){
        // this.getData()
        axios.get('http://127.0.0.1:8000/product')
        .then(res => {
            if (this.state._isMounted) {
                this.setState({
                    isLoading: false,
                    productData:res.data,
                })
              }

        })

        let newData = [...this.state.productData]
        let temProduct = [...this.state.product]
        console.log(newData)
        for(var i = 1; i <= newData.length; i++){
            let n = newData[i].id
            let t = temProduct[i].id
            if(n !== t){
                newData = n
                console.log('the new data',newData)
                this.setState({
                    productData:[...temProduct, newData],
                },()=>{
                    // console.log('the new DATA',this.state.productData)
                    this.setProducts()
                })
            }
            }
        // newData = newData.filter(item => item.id !== temProduct )
    }

    componentWillUnmount() {
        // this._isMounted = false;
        this.state._isMounted = false

      }

    setProducts(){
        let temProduct = []
        const pro = this.state.productData
        pro.forEach(item => {
            const singleItem = {...item};
            temProduct = [...temProduct, singleItem]
        })

        this.setState(()=>{
        return {
            product: temProduct,
            _isMounted:false
        }
        })


    }

    getItem (id){
        const pro = this.state.product.find(item =>item.id === id);
        return pro;
    }

    handelDetail(id){
        const product = this.getItem(id);
        // console.log(product);
        this.setState(() => {
          return  {detailProduct: product}
        })
    }

    addToCart(id){
        let temProduct = [...this.state.product]
        const index = temProduct.indexOf(this.getItem(id))
        const product = temProduct[index]
        product.inCart = true
        product.count = 1
        const price = product.price
        product.total = price
        this.setState({
            product:temProduct,
            cart:[...this.state.cart, product],
        },()=>{
                this.addTotal()
        })
    }
    openModal(id){
        // console.log('openModal')
        const product =this.getItem(id)
        this.setState({
            modalProduct:product,
            modalOpen:true
        })
    }
    closeModal(){
        this.setState({
            modalOpen:false
        })
    }

    increment(id){
        let tempCart = [...this.state.cart]
        const selectedProduct = tempCart.find(item => item.id === id)
        const index = tempCart.indexOf(selectedProduct)
        const product = tempCart[index]
        product.count = product.count + 1
        product.total = product.count * product.price

        this.setState({
            cart: [...tempCart]
        },()=>{
            this.addTotal()
        })

    }

    decrement(id){
        let tempCart = [...this.state.cart]
        const selectedProduct = tempCart.find(item => item.id === id)
        const index = tempCart.indexOf(selectedProduct)
        const product = tempCart[index]
        product.count = product.count - 1

        if(product.count === 0){
            // this.removeItem(id)
            product.count=1
        }
        else{
            product.total = product.count * product.price

            this.setState({
                cart: [...tempCart]
            },()=>{
                this.addTotal()
            })
        }


    }

    removeItem(id){
        let tempProduct =[...this.state.product]
        let tempCart =[...this.state.cart]

        tempCart = tempCart.filter(item => item.id !== id)

        const index = tempProduct.indexOf(this.getItem(id))
        let removedProduct = tempProduct[index]
        removedProduct.inCart = false
        removedProduct.count = 0
        removedProduct.total = 0
        this.setState({
            cart: [...tempCart],
            product: [...tempProduct]
        },()=>{
            this.addTotal()
        })
    }

    clearCart(){
        this.setState({
            cart: []
        },()=>{
            this.setProducts()
            this.addTotal()
        })
    }

    addTotal(){
        let subTotal = 0
        this.state.cart.map(item =>{subTotal += item.total})
        const tempTax = subTotal * 0.1
        const tax = parseFloat(tempTax.toFixed(2))
        const total = subTotal + tax
        this,this.setState({
            cartSubTotal: subTotal,
            cartTax: tax,
            cartTotal: total
        })
    }

    render() {
        return (
            <ProductContext.Provider value={{
                ...this.state,
                handelDetail:this.handelDetail,
                addToCart:this.addToCart,
                getItem:this.getItem,
                openModal:this.openModal,
                closeModal:this.closeModal,
                increment:this.increment,
                decrement:this.decrement,
                removeItem:this.removeItem,
                clearCart:this.clearCart,
                dataRefresh:this.componentDidMount
            }}>
                {this.props.children}
            </ProductContext.Provider>
        )
    }
}

const ProductConsumer = ProductContext.Consumer

export {ProductProvider, ProductConsumer}


