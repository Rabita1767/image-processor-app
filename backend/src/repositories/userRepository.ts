import UserModel from "../models/userModel";
import { IUser } from "../types";
class UserRepository {
  public async createUser(
    userName: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const user = new UserModel({
      userName: userName,
      email: email,
      password: password,
    });
    await user.save();
    return user;
  }
  public async findUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email });
  }
  public async findUserById(userId: string) {
    return await UserModel.findById({ _id: userId });
  }
}
export default new UserRepository();
