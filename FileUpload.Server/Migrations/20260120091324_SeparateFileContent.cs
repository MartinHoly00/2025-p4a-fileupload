using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FileUpload.Server.Migrations
{
    /// <inheritdoc />
    public partial class SeparateFileContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_Directories_DirectoryId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "FileBytes",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "ThumbnailBytes",
                table: "Files");

            migrationBuilder.AlterColumn<int>(
                name: "DirectoryId",
                table: "Files",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "ContentId",
                table: "Files",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "FileContents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileBytes = table.Column<byte[]>(type: "bytea", nullable: false),
                    ThumbnailBytes = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileContents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Files_ContentId",
                table: "Files",
                column: "ContentId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Directories_DirectoryId",
                table: "Files",
                column: "DirectoryId",
                principalTable: "Directories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_FileContents_ContentId",
                table: "Files",
                column: "ContentId",
                principalTable: "FileContents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_Directories_DirectoryId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_FileContents_ContentId",
                table: "Files");

            migrationBuilder.DropTable(
                name: "FileContents");

            migrationBuilder.DropIndex(
                name: "IX_Files_ContentId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "ContentId",
                table: "Files");

            migrationBuilder.AlterColumn<int>(
                name: "DirectoryId",
                table: "Files",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "FileBytes",
                table: "Files",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "ThumbnailBytes",
                table: "Files",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Directories_DirectoryId",
                table: "Files",
                column: "DirectoryId",
                principalTable: "Directories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
