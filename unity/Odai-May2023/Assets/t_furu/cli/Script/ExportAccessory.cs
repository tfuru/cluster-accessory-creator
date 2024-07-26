using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using System;

public class ExportAccessory : MonoBehaviour
{
    // Start is called before the first frame update
    void Awake()
    {
        Debug.Log("ExportAccessory Awake()");
        // Application.targetFrameRate = 60;

        /*
        string[] args = System.Environment.GetCommandLineArgs();
        var log = "args " + string.Join(" ", args);
        var t = Task.Run(() =>
        {
            Debug.Log(log);
        });
        t.Wait();
        */
    }

    void Start()
    {
        Debug.Log("ExportAccessory Start()");
    }
}
