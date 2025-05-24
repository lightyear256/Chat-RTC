import type { RefObject } from 'react';

interface InputProps{
    placeholder:string,
    type:string
    refer: RefObject<HTMLInputElement>
}
export function Input(props:InputProps){
    return(
        <div className="flex flex-col justify-center">
        <div>{props.placeholder}</div>
               <input
            type={props.type}
            placeholder={props.placeholder}
            ref={props.refer}
            className=" flex-1 p-3 border-2 border-gray-800 text-white rounded-l-md focus:outline-none "
          />
          </div>
    )
}