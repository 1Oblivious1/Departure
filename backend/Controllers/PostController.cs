using backend.Models.Task_models;
using backend.Services.Task_serv;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public PostController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NewsFeedPost>> GetPost(int id)
        {
            var posts = await _taskService.GetNewsFeedAsync();
            var post = posts.FirstOrDefault(p => p.IdNewsFeed == id);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post);
        }

        [HttpPost("{id}/comment")]
        public async Task<ActionResult<NewsFeedPost>> AddComment(int id, [FromBody] AddCommentRequest request)
        {
            var post = await _taskService.AddCommentAsync(id, request.UserId, request.Text);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post);
        }

        [HttpPost("{id}/like")]
        public async Task<ActionResult<NewsFeedPost>> LikePost(int id)
        {
            var post = await _taskService.LikePostAsync(id);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post);
        }
    }

    public class AddCommentRequest
    {
        public int UserId { get; set; }
        public string Text { get; set; }
    }
} 