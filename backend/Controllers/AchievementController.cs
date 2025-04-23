using backend.Models.Task_models;
using backend.Services.Task_serv;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AchievementController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public AchievementController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost]
        public async Task<ActionResult<Achievement>> CreateAchievement([FromBody] CreateAchievementRequest request)
        {
            var achievement = await _taskService.CreateAchievementAsync(request.Name, request.Points);
            if (achievement == null)
            {
                return BadRequest();
            }
            return Ok(achievement);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Achievement>>> GetUserAchievements(int userId)
        {
            var achievements = await _taskService.GetUserAchievementsAsync(userId);
            return Ok(achievements);
        }
    }

    public class CreateAchievementRequest
    {
        public string Name { get; set; }
        public int Points { get; set; }
    }
} 