/**
 * 传入动作数组，计算出方块个数
 * */ 

export function cubeNum(arr){
    let res = 0
    arr.forEach((a,index) => {
        if(typeof a == 'number'){
            res +=1
        }else{
            res +=a.length
        }
    })
    return res
}


/**
 * 传入动作数组，传入bpm数组，计算出每个方块的位置
 * */ 
export function cubePos(arr,bpm){
    
}

