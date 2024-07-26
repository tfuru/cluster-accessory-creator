using System;
using System.IO;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClusterVR.CreatorKit.Editor.Api.AccessoryTemplate;
using Newtonsoft.Json;
using UnityEngine.Networking;

namespace ClusterVR.CreatorKit.Editor.Api.RPC
{
    public class UploadAccessoryExport
    {
        // payload をファイル出力する
        public static void exportFile(string fileName, byte[] binary) 
        {
            var assetsFolderFullPath = Path.GetFullPath("Assets");
            Console.WriteLine("assetsFolderFullPath " + assetsFolderFullPath);

            /*
            var writer = new BinaryWriter(new FileStream(fileName, FileMode.Create));
            try
            {
                writer.Write(binary);
            }
            finally
            {
                writer.Close();
            }
            */
        }
    }
}