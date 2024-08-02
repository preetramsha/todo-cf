import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const user = sqliteTable('user',{
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    created_at: text('created_at').notNull().default(sql`(current_timestamp)`),
    n_todos: integer('n_todos').$defaultFn(() => 0)
})

const todos = sqliteTable('todos',{
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    desc: text('desc').notNull(),
    created_at: text('created_at').notNull().default(sql`(current_timestamp)`),
    completed: integer('completed',{mode:'boolean'}).$defaultFn(() => 0),
    user_id: text('user_id').notNull().references(()=> user.id , { onDelete: 'cascade' })
})

export {
    user,
    todos
}