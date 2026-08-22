# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["MedicineAvailability.Api.csproj", "./"]
RUN dotnet restore "MedicineAvailability.Api.csproj"

# Copy remaining source code and publish
COPY . .
RUN dotnet publish "MedicineAvailability.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Copy published application from build stage
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "MedicineAvailability.Api.dll"]
