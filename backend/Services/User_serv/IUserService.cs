using backend.Models.User_models;

namespace backend.Services.User_serv
{
    public interface IUserService
    {
        User RegisterUser(string name, string mail, string password, DateTime createdAt, string avatarUrl);
        User? LoginUser(string mail, string password);
        UserProfilePrivate? FindPrivateProfileByMail(string mail);
    }
}