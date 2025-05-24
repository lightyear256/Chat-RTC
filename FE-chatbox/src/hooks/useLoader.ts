import { useRecoilState } from "recoil";
import { LoadingAtom } from "../stores/atoms/LoadingAtom";

export function useLoader(key:string){
    const [loading,setLoading]=useRecoilState(LoadingAtom(key));

    const runWithLoad=async(fn: ()=>Promise<void>| void)=>{
        console.log("loadinf......");
        setLoading(true);
        try{
        await fn()
        }finally{
            setLoading(false)
        }
    };

    return{loading,runWithLoad}
}