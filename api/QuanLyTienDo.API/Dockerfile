# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY QuanLyTienDo.API.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Non-root user (uid/gid 1001, matches web container convention)
RUN groupadd -g 1001 dotnet && useradd -u 1001 -g dotnet -s /sbin/nologin -M dotnet

COPY --from=build --chown=dotnet:dotnet /app/publish ./

ENV ASPNETCORE_URLS=http://+:5015
ENV ASPNETCORE_ENVIRONMENT=Production

USER dotnet

EXPOSE 5015
ENTRYPOINT ["dotnet", "QuanLyTienDo.API.dll"]
