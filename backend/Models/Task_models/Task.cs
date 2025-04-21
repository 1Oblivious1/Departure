using System.ComponentModel.DataAnnotations;

namespace backend.Models.Task_models
{
    public class TaskModel
    {
        public int IdTask { get; set; }
        
        [Required]
        [StringLength(30)]
        public string Title { get; set; }
        
        [StringLength(200)]
        public string Description { get; set; }
        
        [Required]
        public TaskDifficulty Difficulty { get; set; }
        
        [Required]
        public double Latitude { get; set; }
        
        [Required]
        public double Longitude { get; set; }
    }

    public enum TaskDifficulty
    {
        Easy,
        Medium,
        Hard
    }
} 