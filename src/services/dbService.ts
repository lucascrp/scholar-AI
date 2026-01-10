import { openDB, IDBPDatabase } from 'idb';
import type { Course, AppSettings } from '../types';

const DB_NAME = 'ScholarAI';
const DB_VERSION = 1;

interface ScholarAIDB {
  courses: {
    key: string;
    value: Course;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

class DatabaseService {
  private db: IDBPDatabase<ScholarAIDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<ScholarAIDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store per i corsi
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        // Store per le impostazioni
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      }
    });
  }

  // === CORSI ===
  
  async saveCourse(course: Course): Promise<void> {
    await this.init();
    course.updatedAt = Date.now();
    await this.db!.put('courses', course);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    await this.init();
    return this.db!.get('courses', id);
  }

  async getAllCourses(): Promise<Course[]> {
    await this.init();
    return this.db!.getAll('courses');
  }

  async deleteCourse(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('courses', id);
  }

  async softDeleteCourse(id: string): Promise<void> {
    await this.init();
    const course = await this.getCourse(id);
    if (course) {
      course.deletedAt = Date.now();
      await this.saveCourse(course);
    }
  }

  async restoreCourse(id: string): Promise<void> {
    await this.init();
    const course = await this.getCourse(id);
    if (course) {
      delete course.deletedAt;
      await this.saveCourse(course);
    }
  }

  // === IMPOSTAZIONI ===

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.init();
    await this.db!.put('settings', settings, 'app_settings');
  }

  async getSettings(): Promise<AppSettings | undefined> {
    await this.init();
    return this.db!.get('settings', 'app_settings');
  }

  // === UTILITY ===

  async clearAll(): Promise<void> {
    await this.init();
    await this.db!.clear('courses');
    await this.db!.clear('settings');
  }
}

export const dbService = new DatabaseService();

// Impostazioni di default
export const DEFAULT_SETTINGS: AppSettings = {
  selectedModelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  theme: 'light',
  language: 'it'
};
