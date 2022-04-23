import { Context, Scenes } from "telegraf";

export default interface AppContext extends Context {  
    scene: Scenes.SceneContextScene<AppContext>
}