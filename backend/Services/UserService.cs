using System.Text.Json;
using backend.Models;

namespace backend.Services
{
    public static class UserService
    {
        private static readonly string _filePath = "users.json";
        private static List<User> _users = new();

        public static void LoadData()
        {
            if (File.Exists(_filePath))
            {
                var json = File.ReadAllText(_filePath);
                _users = JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
            }
        }

        public static void SaveData()
        {
            var json = JsonSerializer.Serialize(_users);
            File.WriteAllText(_filePath, json);
        }

        public static void AddUser(User user)
        {
            user.Id = _users.Count + 1;
            _users.Add(user);
            SaveData();
        }

        public static User? FindUser(string username)
        {
            return _users.FirstOrDefault(u => u.Username == username);
        }
    }
}