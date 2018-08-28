import React from 'react'

interface SubProps {
  sub(h: any): any
  handleSubPayload(params: {
    payload: any
    setState(arg: any, ...rest: any[]): any
    props: any
  }): any
  initialState: { [key: string]: any }
  children(stuff: {
    props: any
    state: any
  }): JSX.Element | JSX.Element[] | null
}

export class Sub extends React.Component<SubProps> {
  unsub: () => any
  mounted = false
  state = this.props.initialState
  componentDidMount() {
    this.mounted = true
    this.unsub = this.props.sub.call(
      this.props.sub,
      this._internalHandlePayload,
    )
  }
  componentWillUnmount() {
    this.mounted = false
    if (this.unsub) {
      this.unsub()
    }
  }
  _internalHandlePayload = (payload: any) => {
    console.log(payload.toString())
    const { handleSubPayload } = this.props
    handleSubPayload({ payload, setState: this._setState, props: this.props })
  }
  _setState = (arg: any, ...rest: any[]) => {
    if (this.mounted) {
      this.setState(arg, ...rest)
    }
  }

  render() {
    const { props, state } = this
    return this.props.children({ props, state })

    // return (
    //   <div>
    //     <SubComp
    //       initialState={{links: []}}
    //       sub={firebase.firestore().collection('example').onSnapshot}
    //       handleSubPayload={({payload, setState, props}: any) => {
    //         setState(() => ({links: payload}))
    //       }}
    //     >{() => (
    //       <div>
    //       </div>
    //     )}</SubComp>
    //   </div>
    // )
  }
}
