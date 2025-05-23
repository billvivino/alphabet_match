﻿using UnityEngine;

#if UNITY_EDITOR
using UnityEditor;
#endif

using AlmostEngine.Screenshot;

namespace AlmostEngine.Preview
{
	public class UniversalDevicePreview
	{
		public static string VERSION = "Universal Device Preview v1.9.1";
		public static string AUTHOR = "(c)Arnaud Emilien - support@wildmagegames.com";

		#if UNITY_EDITOR
		public static void About ()
		{
			EditorUtility.DisplayDialog ("About", VERSION + "\n" + AUTHOR, "Close");
		}
		#endif

	}
}

