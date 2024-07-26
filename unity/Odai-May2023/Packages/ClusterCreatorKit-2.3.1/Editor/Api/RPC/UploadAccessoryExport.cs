using System;
using System.IO;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClusterVR.CreatorKit.Editor.Api.AccessoryTemplate;
using Newtonsoft.Json;
using UnityEngine.Networking;
using UnityEngine;

namespace ClusterVR.CreatorKit.Editor.Api.RPC
{
    public class UploadAccessoryExport
    {
        const string FolderName = "t_furu/export/Accessory";

        // payload をファイル出力する
        public static void exportFile(string fileName, byte[] binary) 
        {
            var assetsFolderFullPath = Path.GetFullPath("Assets");
            Debug.Log("assetsFolderFullPath " + assetsFolderFullPath);
            // assetsFolderFullPath 以下に t_furu/AccessoryExport フォルダを作成する
            var accessoryExportFolderFullPath = Path.Combine(assetsFolderFullPath, FolderName);
            Debug.Log("accessoryExportFolderFullPath " + accessoryExportFolderFullPath);
            Directory.CreateDirectory(accessoryExportFolderFullPath);
            // accessoryExportFolderFullPath 以下に fileName でファイルを作成する
            var filePath = Path.Combine(accessoryExportFolderFullPath, fileName);
            Debug.Log("filePath " + filePath);
            File.WriteAllBytes(filePath, binary);
        }
    }
}