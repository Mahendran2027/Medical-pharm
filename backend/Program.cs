using System.Text;
using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.Middleware;
using MedicineAvailability.Api.Services;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Configuration Sources & Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT Security Definition
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Real-Time Medicine Availability & Pharmacy System API",
        Version = "v1",
        Description = "Enterprise REST API for Real-Time Pharmacy Inventory & Medicine Reservations"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 2. Database Context Configuration
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                          ?? builder.Configuration["DB_CONNECTION_STRING"]
                          ?? "Host=localhost;Database=MedicineAvailabilityDb;Username=postgres;Password=postgres";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddHealthChecks();

// 3. Authentication & JWT Configuration
string jwtSecret = builder.Configuration["Jwt:Key"] 
                  ?? builder.Configuration["JwtSettings:SecretKey"] 
                  ?? builder.Configuration["JWT_SECRET_KEY"]
                  ?? "SuperSecretKeyForPharmacySystem2025SecureKeyNeverExposeInProduction!";
string jwtIssuer = builder.Configuration["Jwt:Issuer"] 
                  ?? builder.Configuration["JwtSettings:Issuer"] 
                  ?? builder.Configuration["JWT_ISSUER"]
                  ?? "MedicineAvailabilityApi";
string jwtAudience = builder.Configuration["Jwt:Audience"] 
                  ?? builder.Configuration["JwtSettings:Audience"] 
                  ?? builder.Configuration["JWT_AUDIENCE"]
                  ?? "MedicineAvailabilityApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Register Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPharmacyService, PharmacyService>();
builder.Services.AddScoped<IMedicineService, MedicineService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// 5. CORS Configuration for React Frontend
var allowedOriginsConfig = builder.Configuration["Cors:AllowedOrigins"] 
    ?? builder.Configuration["CORS_ALLOWED_ORIGINS"] 
    ?? "http://localhost:3000,http://localhost:5173,http://localhost,https://localhost";

var allowedOrigins = allowedOriginsConfig.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment() || allowedOrigins.Contains("*"))
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// 6. Middleware Pipeline
app.UseGlobalExceptionHandler();

if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwagger", false))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health Check Endpoint
app.MapGet("/health", async (ApplicationDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new { status = "Healthy", database = canConnect ? "Connected" : "Disconnected", timestamp = DateTime.UtcNow });
    }
    catch (Exception ex)
    {
        return Results.Json(new { status = "Unhealthy", error = ex.Message, timestamp = DateTime.UtcNow }, statusCode: 500);
    }
});

// Auto-migrate & Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        await dbContext.Database.MigrateAsync();
        await DataSeeder.SeedAsync(dbContext);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "MigrateAsync warning or no migration files found. Falling back to EnsureCreatedAsync.");
        try
        {
            await dbContext.Database.EnsureCreatedAsync();
            await DataSeeder.SeedAsync(dbContext);
        }
        catch (Exception innerEx)
        {
            app.Logger.LogError(innerEx, "An error occurred while seeding/creating the database.");
        }
    }
}

app.Run();
