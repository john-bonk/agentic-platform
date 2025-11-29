/**
 * Storage Interface
 * 
 * Defines the storage layer for the application.
 * Uses in-memory storage by default, easy to switch to database.
 * 
 * Pattern:
 * 1. Define interface with CRUD methods
 * 2. Implement MemStorage for development
 * 3. Can create DbStorage for production (using Drizzle)
 * 
 * TODO: Add your own storage methods as needed
 */

import { 
  type User, type InsertUser,
  type Project, type InsertProject,
  type Task, type InsertTask,
} from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Storage Interface
 * Define all data access methods here
 */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  getTasks(projectId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
}

/**
 * In-Memory Storage Implementation
 * Good for development and prototyping
 */
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    
    this.seedExampleData();
  }

  private seedExampleData() {
    const now = new Date();
    
    const exampleProjects: Project[] = [
      { id: "p1", name: "Website Redesign", description: "Modernize the company website", status: "active", ownerId: null, createdAt: now, updatedAt: now },
      { id: "p2", name: "Mobile App", description: "Build iOS and Android app", status: "active", ownerId: null, createdAt: now, updatedAt: now },
      { id: "p3", name: "API Integration", description: "Connect third-party services", status: "completed", ownerId: null, createdAt: now, updatedAt: now },
    ];
    
    exampleProjects.forEach(p => this.projects.set(p.id, p));
    
    const exampleTasks: Task[] = [
      { id: "t1", title: "Design mockups", description: "Create UI designs", completed: true, projectId: "p1", assigneeId: null, dueDate: null, createdAt: now },
      { id: "t2", title: "Implement frontend", description: "Build React components", completed: false, projectId: "p1", assigneeId: null, dueDate: null, createdAt: now },
      { id: "t3", title: "Setup CI/CD", description: "Configure deployment pipeline", completed: false, projectId: "p2", assigneeId: null, dueDate: null, createdAt: now },
    ];
    
    exampleTasks.forEach(t => this.tasks.set(t.id, t));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      email: insertUser.email || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description || null,
      status: insertProject.status || "draft",
      ownerId: insertProject.ownerId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getTasks(projectId?: string): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    if (projectId) {
      return tasks.filter(t => t.projectId === projectId);
    }
    return tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description || null,
      completed: insertTask.completed || false,
      projectId: insertTask.projectId || null,
      assigneeId: insertTask.assigneeId || null,
      dueDate: insertTask.dueDate || null,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updated: Task = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
