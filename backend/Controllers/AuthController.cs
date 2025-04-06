using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        // Регистрация
        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            if (_db.Users.Any(u => u.Username == user.Username))
                return BadRequest("User already exists");

            _db.Users.Add(user);
            _db.SaveChanges();
            return Ok("Registered");
        }

        // Авторизация
        [HttpPost("login")]
        public IActionResult Login([FromBody] User user)
        {
            var existingUser = _db.Users
                .FirstOrDefault(u => u.Username == user.Username && u.Password == user.Password);

            if (existingUser == null)
                return Unauthorized("Invalid credentials");

            return Ok("Logged in");
        }
    }
}