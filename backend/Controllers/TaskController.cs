using backend.Models.Task_models;
using backend.Services.Task_serv;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost]
        public async Task<ActionResult<TaskModel>> CreateTask([FromBody] CreateTaskRequest request)
        {
            var task = new TaskModel
            {
                Title = request.Title,
                Description = request.Description,
                Difficulty = request.Difficulty,
                Latitude = request.Latitude,
                Longitude = request.Longitude
            };

            var createdTask = await _taskService.CreateTaskAsync(task);
            return Ok(createdTask);
        }

        [HttpGet]
        public async Task<ActionResult<List<TaskModel>>> GetAllTasks()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskModel>> GetTaskById(int id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            return Ok(task);
        }

        [HttpGet("user/{userId}/submissions")]
        public async Task<ActionResult<List<TaskSubmission>>> GetUserTaskSubmissions(int userId)
        {
            var submissions = await _taskService.GetUserTaskSubmissionsAsync(userId);
            return Ok(submissions);
        }

        [HttpPost("start")]
        public async Task<ActionResult<TaskSubmission>> StartTask([FromBody] StartTaskRequest request)
        {
            var submission = await _taskService.StartTaskAsync(request.UserId, request.TaskId);
            return Ok(submission);
        }

        [HttpPost("complete/{submissionId}")]
        public async Task<ActionResult<TaskSubmission>> CompleteTask(int submissionId)
        {
            var submission = await _taskService.CompleteTaskAsync(submissionId);
            if (submission == null)
            {
                return NotFound();
            }
            return Ok(submission);
        }

        [HttpPost("fail/{submissionId}")]
        public async Task<ActionResult<TaskSubmission>> FailTask(int submissionId)
        {
            var submission = await _taskService.FailTaskAsync(submissionId);
            if (submission == null)
            {
                return NotFound();
            }
            return Ok(submission);
        }
    }

    public class CreateTaskRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public TaskDifficulty Difficulty { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class StartTaskRequest
    {
        public int UserId { get; set; }
        public int TaskId { get; set; }
    }
} 