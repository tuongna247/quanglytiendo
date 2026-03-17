# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY QuanLyTienDo.API.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore -p:PublishReadyToRun=true

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:5015
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5015
ENTRYPOINT ["dotnet", "QuanLyTienDo.API.dll"]
