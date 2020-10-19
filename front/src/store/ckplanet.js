import {getData} from "@/ckb/data_server"
import { getUrl,vaildDataType } from "../ckb/ckplanet"
import Vue from 'vue'
const ckplanet = {
    state :() => ({

        wallet_connected:false,
        data_server_connected:false,

        
        user_profiles_pool:{
            
        },
        
        user_joined_cycles:[],
        user_managed_cycles_index:[],

        cycles_pool:{},


    }),
    mutations:{
        updateJoinedCyclesIndex(){},
        updateCyclesPool(state,{access_token,cycle_id,cycle_props}){

            if(! (access_token in state.cycles_pool)){
                Vue.set(
                    state.cycles_pool,
                    access_token,
                    {[cycle_id]:cycle_props})
                return}
            if(! (cycle_id in state.cycles_pool[access_token])){
                Vue.set(
                    state.cycles_pool[access_token],
                    cycle_id,
                    cycle_props)
                return
            }
            let cycle = state.cycles_pool[access_token][cycle_id]
            cycle = {...cycle,...cycle_props}
            Vue.set(
                state.cycles_pool[access_token],
                cycle_id,
                cycle
            )
        },
        updateManagedCyclesIndex(state,payload){
            state.user_managed_cycles_index = payload
        },
        updateUserInfo(state,{lock_args,nickname,avatar_url}){

            let user_profiles = {nickname,avatar_url}
            if (! (lock_args in user_profiles)){
                Vue.set(state.user_profiles_pool,lock_args,user_profiles)
                state.user_profiles_pool[lock_args] = user_profiles
            }
            else{
                let user_profiles_old = state.user_profiles_pool[lock_args]
                for(const key in user_profiles_old){
                    if(  typeof(user_profiles[key]) === "undefined"){
                        user_profiles[key] = user_profiles_old[key]
                }}
                Vue.set(state.user_profiles_pool,lock_args,user_profiles)
                //tate.user_profiles_pool = {...state.user_profiles_pool, user_profiles } 
            }
        },
        walletConnect(state,s=false){
            state.wallet_connected = s
        },
        dataServerConnect(state,s=false){
            state.data_server_connected = s
        }
    },
    actions:{
        async getUserProfile({commit,getters},lock_args){
            let res = null
            let tmp1 = getters.getSthFromPool(lock_args,"data_server")
            let tmp2 = getters.getSthFromPool(lock_args,"access_token")
            if (tmp1 !== null && tmp2 !== null){
                const server_url = tmp1.ip

                try {
                    const url = getUrl('user_profile',tmp2)
                    res = await getData(server_url,url)
                    if(res === null){
                        return res
                    }
                    if (vaildDataType("user_profile",res)){
                        commit("updateUserInfo",{...res,lock_args,})
                    }
                    
                } catch (error) {
                    console.error("getUserProfile error",error)
                    throw(error)
                }
                
            }
            return res
        },
        async getManagedCycles({commit,getters},lock_args){
            let res = null
            let tmp1 = getters.getSthFromPool(lock_args,"data_server")
            let tmp2 = getters.getSthFromPool(lock_args,"access_token")
            if (tmp1 !== null && tmp2 !== null){
                const server_url = tmp1.ip

                try {
                    let data_type = 'user_managed_cycle_list'
                    const url = getUrl(data_type,tmp2)
                    res = await getData(server_url,url)
                    if(res === null){
                        return res
                    }
                    if (vaildDataType(data_type,res)){
                        commit("updateManagedCyclesIndex",res)
                    }
                    
                } catch (error) {
                    console.error("getUserProfile error",error)
                    throw(error)
                }
                
            }
            return res
        },
    },
    getters:{
      userProfile: (state) =>
          (lock_args) =>{
              if(lock_args in state.user_profiles_pool){
                  return state.user_profiles_pool[lock_args]
              }
              return null
          }
      
    },

}


export default  ckplanet