using System.Security.Cryptography;
using backend.Repositories.User_repo;
using backend.Models.User_models;

namespace backend.Services.User_serv
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public User RegisterUser(string name, string mail, string password, DateTime createdAt, string avatarUrl)
        {
            var existingProfile = _userRepository.FindPrivateProfileByMail(mail);
            if (existingProfile != null)
                throw new Exception("Пользователь с таким email уже существует");

            var publicProfile = new UserProfilePublic
            {
                Name = name,
                Points = 0,
                CreatedAt = createdAt,
                AvatarUrl = avatarUrl
            };
            _userRepository.AddPublicProfile(publicProfile);

            var privateProfile = new UserProfilePrivate
            {
                Password = HashPassword(password),
                Mail = mail
            };
            _userRepository.AddPrivateProfile(privateProfile);

            var user = new User
            {
                IdUserProfilePublic = publicProfile.IdUserProfilePublic,
                IdUserProfilePrivate = privateProfile.IdUserProfilePrivate
            };
            _userRepository.AddUser(user);
            return user;
        }

        public User? LoginUser(string mail, string password)
        {
            var privateProfile = _userRepository.FindPrivateProfileByMail(mail);
            if (privateProfile == null || privateProfile.Password != HashPassword(password))
                return null;

            return _userRepository.FindUserById(privateProfile.IdUserProfilePrivate);
        }

        public UserProfilePrivate? FindPrivateProfileByMail(string mail)
        {
            return _userRepository.FindPrivateProfileByMail(mail);
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            byte[] bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public void SubscribeUser(int subscriberId, int targetUserId)
        {
            _userRepository.SubscribeUser(subscriberId, targetUserId);
        }

        public void UnsubscribeUser(int subscriberId, int targetUserId)
        {
            _userRepository.UnsubscribeUser(subscriberId, targetUserId);
        }

        public (List<UserProfilePublic> Subscriptions, List<UserProfilePublic> Subscribers) GetUserSubscriptions(int userId)
        {
            return _userRepository.GetUserSubscriptions(userId);
        }

        public int CheckSubscriptionStatus(int subscriberId, int targetUserId)
        {
            return _userRepository.CheckSubscriptionStatus(subscriberId, targetUserId);
        }
    }
}