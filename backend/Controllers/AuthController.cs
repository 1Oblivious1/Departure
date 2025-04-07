using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    public AuthController()
    {
        UserService.LoadData(); // Загружаем данные при старте
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] User user)
    {
        if (UserService.FindUser(user.Username) != null)
            return BadRequest("User already exists");

        UserService.AddUser(user);
        return Ok("Registered");
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] User user)
    {
        var existingUser = UserService.FindUser(user.Username);
        if (existingUser == null || existingUser.Password != user.Password)
            return Unauthorized("Invalid credentials");

        return Ok("Logged in");
    }
}