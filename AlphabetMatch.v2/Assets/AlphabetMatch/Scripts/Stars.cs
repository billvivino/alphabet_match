using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Stars : MonoBehaviour
{
    Vector3 StartPosition;
	bool AnimateFlag;
	
	float gravity;
	float x_position;
	float y_position;
	float x_velocity;
	float y_velocity;
	
	// Start is called before the first frame update
    void Start()
    {
        AnimateFlag = false;
		StartPosition = new Vector3(transform.localPosition.x, transform.localPosition.y, transform.localPosition.z);
		gameObject.SetActive(false);
    }
	
	public void Reset(){
		AnimateFlag = false;
		transform.localPosition = new Vector3(StartPosition.x, StartPosition.y, StartPosition.z);
		gameObject.SetActive(false);
	}
	
	public void Animate(){
		x_position = StartPosition.x;
		y_position = StartPosition.y;
		x_velocity = Random.Range(30f, 80f);
		y_velocity = Random.Range(340f,360f);
		if (Random.Range(0f, 100f) > 50){
			x_velocity *= -1;
		}
		gravity = -12f;
		AnimateFlag = true;
		gameObject.SetActive(true);
	}

    // Update is called once per frame
    void Update()
    {
        if (AnimateFlag){
			x_position += Time.deltaTime * x_velocity;
			y_position += Time.deltaTime * y_velocity;
			y_velocity += gravity;
			/*if (y_position > StartPosition.y + 40){
				y_position = StartPosition.y + 40;
				y_velocity *= -1;
			}*/		
			transform.localPosition = new Vector3(x_position, y_position, StartPosition.z);
			if (y_position < -300f){
				AnimateFlag = false;
			}
		}
    }
}
