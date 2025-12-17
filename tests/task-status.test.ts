import { Database } from "bun:sqlite"; 
import { describe, it, expect, beforeEach } from "bun:test"
import { Priority, Status, TaskTable } from "../src/namespaces/task/task";

let db: Database

beforeEach(() => {
  db = new Database(":memory:")

    db.run(`
    DROP TABLE IF EXISTS tasks;
    CREATE TABLE task (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL
        );
    `);
    console.log("Database creee"); // pass
})  

it("de TO_DO à IN_PROGRESS", async () => {
    const id = "task-1" as any

    await TaskTable(db).insert({
        id,
        title: "Test",
        description: "bla bla bla",
        priority: Priority.HIGH,
        status: Status.TO_DO,
        createdAt: new Date().toISOString(),
    })

    const result = await TaskTable(db).select().where("id", "=", id).run()

    const tasks = result.unwrap()[0]
    if (!tasks) {
    throw new Error("Task not found") 
    } 

    const updateStatus = {...tasks, status: Status.IN_PROGRESS}
    await TaskTable(db).update(updateStatus)

    const checkResult = await TaskTable(db).select().where("id", "=", id).run() 

    const updatedTask = checkResult.unwrap()[0]
    if (!updatedTask) {
        throw new Error("Task not found after status update")
    }

    expect(updatedTask.status).toBe(Status.IN_PROGRESS)
})

it("de IN_PROGRESS à DONE", async () => {
    const id = "task-2" as any

    await TaskTable(db).insert({
        id,
        title: "Test 2",
        description: "bli bli bli",
        priority: Priority.MEDIUM,
        status: Status.IN_PROGRESS,
        createdAt: new Date().toISOString(),
    })

    const result = await TaskTable(db).select().where("id", "=", id).run()

    const tasks = result.unwrap()[0]
    if (!tasks) {
    throw new Error("Task not found") 
    } 

    const updateStatus = {...tasks, status: Status.DONE}
    await TaskTable(db).update(updateStatus)

    const checkResult = await TaskTable(db).select().where("id", "=", id).run() 

    const updatedTask = checkResult.unwrap()[0]
    if (!updatedTask) {
        throw new Error("Task not found after status update")
    }

    await TaskTable(db).update({id, status: Status.DONE } as any)
    expect(updatedTask.status).toBe(Status.DONE)
})
                  