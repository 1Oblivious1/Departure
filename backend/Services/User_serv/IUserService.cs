using backend.Models.User_models;

namespace backend.Services.User_serv
{
    public interface IUserService
    {
        void RegisterUser(string name, string mail, string password, DateTime createdAt);
        User? LoginUser(string mail, string password);
        UserProfilePrivate? FindPrivateProfileByMail(string mail);
    }
}