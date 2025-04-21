using System.ComponentModel.DataAnnotations;

namespace backend.Models.Task_models
{
    public class TaskSubmission
    {
        public int IdTaskSubmission { get; set; }
        
        [Required]
        public TaskSubmissionStatus Status { get; set; }
        
        [Required]
        public DateTime StartedAt { get; set; }
        
        public DateTime? EndedAt { get; set; }
        
        [Required]
        public int IdUser { get; set; }
        
        [Required]
        public int IdTask { get; set; }
        
        public string PhotoUrl { get; set; }
    }

    public enum TaskSubmissionStatus
    {
        Pending,
        Completed,
        Failed
    }
} 