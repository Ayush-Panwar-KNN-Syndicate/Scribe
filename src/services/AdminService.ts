// import { getCurrentUser } from './AuthService'

export class AdminService {
  public static async isAdmin(role:string | undefined): Promise<boolean> {
    // const author = await getCurrentUser()

    // if (!author) return false

     return role === 'admin'

    // return true;
    }
}

export const isAdmin = AdminService.isAdmin.bind(AdminService)
