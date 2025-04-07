using backend.Services;

var builder = WebApplication.CreateBuilder(args);

// ��������� ������� � ���������
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true; // �������� JSON
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // ������������������ � ��������
    });

// ��������� ������ ������������� ��� ������
UserService.LoadData();

var app = builder.Build();

// ��������� ��������� HTTP-��������
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();