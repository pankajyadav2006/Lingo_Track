import { useState, useEffect } from "react"
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions } from "react-native"
import { Accelerometer } from "expo-sensors"

const scr = Dimensions.get("window")
const WW = scr.width
const HH = scr.height

const P_W = 55
const P_H = 55
const B_W = 38
const B_H = 38


export default function App(){

    const [posX, setPosX] = useState((WW-P_W)/2)
    const [things, setThings] = useState([])
    const [dead, setDead] = useState(false)


    const again = ()=> {
        setThings([])
        setDead(false)
    }


    // moving by tilt
    useEffect(()=>{
        Accelerometer.setUpdateInterval(18)
        const sub = Accelerometer.addListener(({x})=>{
            setPosX(prev=>{
                let nx = prev + x*27
                if(nx<0) nx=0
                if(nx>WW-P_W) nx=WW-P_W
                return nx
            })
        })
        return ()=>sub.remove()
    },[])




    // making blocks
    useEffect(()=>{
        if(dead) return

        const sp = setInterval(()=>{
            setThings(old=>[
                ...old,
                {
                    id: Math.random()*999999,
                    x: Math.random()*(WW-B_W),
                    y: HH+40
                }
            ])
        }, 880)

        return ()=>clearInterval(sp)
    }, [dead])



    // falling blocks
    useEffect(()=>{
        if(dead) return
        const t = setInterval(()=>{
            setThings(list=> list.map(i=>({
                ...i, y:i.y-11
            })).filter(i=>i.y>-50))
        }, 47)
        return ()=>clearInterval(t)
    },[dead])



    // checking hit
    useEffect(()=>{
        const pL = posX
        const pR = posX + P_W
        const pB = 25
        const pT = pB + P_H

        things.forEach(b=>{
            const l = b.x
            const r = b.x + B_W
            const bot = b.y
            const top = b.y + B_H

            if(r>pL && l<pR && bot<=pT && top>=pB){
                setDead(true)
            }
        })
    }, [things, posX])





    return(
        <TouchableWithoutFeedback onPress={again}>
            <View style={styles.wrap}>

                {things.map(t=>(
                    <View key={t.id} style={[styles.block,{left:t.x, bottom:t.y}]} />
                ))}

                {!dead && (
                    <View style={[styles.player, {left:posX}]} />
                )}

                {dead && (
                    <Text style={styles.deadTxt}>Game Over - tap</Text>
                )}

                <Text style={styles.tip}>Tilt your phone</Text>

            </View>
        </TouchableWithoutFeedback>
    )
}


const styles = StyleSheet.create({
    wrap:{
        flex:1,
        backgroundColor:"#000",
        justifyContent:"flex-end"
    },

    player:{
        position:"absolute",
        bottom:25,
        width:P_W,
        height:P_H,
        backgroundColor:"#fff",
        borderWidth:2
    },

    block:{
        position:"absolute",
        width:B_W,
        height:B_H,
        backgroundColor:"red"
    },

    deadTxt:{
        position:"absolute",
        top:HH/2-20,
        color:"#fff",
        fontSize:23
    },

    tip:{
        position:"absolute",
        top:40,
        color:"#ddd"
    }
})
