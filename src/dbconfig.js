import { drizzle } from 'drizzle-orm/d1';
import { todos, user } from './db/schema.js';
import bcrypt from "bcryptjs";
import { eq,and } from 'drizzle-orm';

const insertUser = async (c,username,pass) => {
    try{
        if (!username||!pass) {
            console.log('prob');
            return false;
        }
        const chkusr = validateUser(c,username,pass);
        if (chkusr.ok) return false;
        const db = drizzle(c.env.DB);
        const hash = bcrypt.hashSync(pass, 8);
        const usr = await db.insert(user).values({username:username,password:hash}).returning({id:user.id,username:user.username});
        c.env.kv.put(username, true);
        if (!usr) return false;
        return usr;
    }catch(e){
        console.log("err insertUser: "+e);
    }
}

const validateUser = async (c,username,pass) => {
    try{
        const db = drizzle(c.env.DB);
        const usr = await db.select({id:user.id,username:user.username,pass:user.password}).from(user).where(eq(user.username,username)).limit(1);
        if(usr.length<1) return false;
        const ok = await bcrypt.compare(pass,usr[0].pass);
        if(!ok) return false;
        console.log("user:",usr[0]);
        return {
            ok,
            data:{
                id:usr[0].id,
                username:usr[0].username
            }
        };
    }catch(e){
        console.log("err validateUser: "+e);
    }
}

const isUsernameAvailable = async (c,username) => {
    try{
        const value = await c.env.kv.get(username);
        if (!value) return true;
        return false;
    }catch(e){
        console.log("err isUsernameAvailable",e)
    }
}

const insertTodo = async (c,username,des) => {
    try {
        const db = drizzle(c.env.DB);
        const uid = await db.select({id:user.id}).from(user).where(eq(user.username,username)).limit(1);
        if(!uid) return false;
        const todo = await db.insert(todos).values({desc:des,user_id:uid[0].id}).returning();
        if (!todo) return false;
        return todo;
    } catch (e) {
        console.log("err addTodo:"+e);
    }
}
const getTodos = async (c,username) => {
    try {
        const db = drizzle(c.env.DB);
        const uid = await db.select({id:user.id}).from(user).where(eq(user.username,username)).limit(1);
        const res = await db.select().from(todos).where(eq(todos.user_id,uid[0].id));
        if(!res) return false;
        return res;
    } catch (e) {
        console.log("err getTodos:"+e);
    }
}
const delTodo = async (c,username,todoid) => {
    try {
        const db = drizzle(c.env.DB);
        const uid = await db.select({id:user.id}).from(user).where(eq(user.username,username)).limit(1);
        const delres = await db.delete(todos).where(and(eq(todos.id,todoid),eq(todos.user_id,uid[0].id))).returning();
        if(!delres) return false;
        return true;
    } catch (e) {
        console.log("err delTodo:"+e);
    }
}
const updTodo = async (c,username,desc,todoid) => {
    try {
        const db = drizzle(c.env.DB);
        const uid = await db.select({id:user.id}).from(user).where(eq(user.username,username)).limit(1);
        const updres = await db.update(todos).set({desc}).where(and(eq(todos.user_id,uid[0].id),eq(todos.id,todoid))).returning({updesc:todos.desc});
        if(!updres) return false;
        return updres;
    } catch (e) {
        console.log("err updTodo:"+e);
    }
}

const deleteUser = async (c,username,password) => {
    try {
        const db = drizzle(c.env.DB);
        const pass = await db.select({pass:user.password}).from(user).where(eq(user.username,username)).limit(1);
        if(pass.length<1) return false;
        const cmppass = bcrypt.compare(password,pass[0].pass);
        if(!cmppass) return false;
        const delusr = await db.delete(user).where(eq(user.username,username)).returning()
        if(!delusr) return false;
        return true;
    } catch (e) {
        console.log("err deleteUser:"+e);
    }
}

export{
    insertUser,
    validateUser,
    isUsernameAvailable,
    insertTodo,
    getTodos,
    delTodo,
    updTodo,
    deleteUser,
}