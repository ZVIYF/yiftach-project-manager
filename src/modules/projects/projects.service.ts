import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getFirestoreDb } from '../../core/firebase';
import { Project, ProjectStatus } from '../../types/project.types';
import { OperationResult } from '../../types/common.types';

/**
 * Service managing Project records in Cloud Firestore.
 */
export class ProjectsService {
  private readonly collectionName = 'projects';

  /**
   * Retrieves all projects ordered chronologically.
   */
  public async getProjects(): Promise<OperationResult<Project[]>> {
    try {
      const db = getFirestoreDb();
      const projectQuery = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(projectQuery);

      const projects: Project[] = snapshot.docs.map((d) => d.data() as Project);
      return { success: true, data: projects };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to retrieve projects',
      };
    }
  }

  /**
   * Creates a new project document in Firestore.
   */
  public async createProject(
    payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<OperationResult<Project>> {
    try {
      const db = getFirestoreDb();
      const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newProject: Project = {
        ...payload,
        id,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, this.collectionName, id), newProject);
      return { success: true, data: newProject };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create project',
      };
    }
  }

  /**
   * Updates project lifecycle status.
   */
  public async updateStatus(projectId: string, status: ProjectStatus): Promise<OperationResult<void>> {
    try {
      const db = getFirestoreDb();
      await updateDoc(doc(db, this.collectionName, projectId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, data: undefined };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update project status',
      };
    }
  }
}

export const projectsService = new ProjectsService();
