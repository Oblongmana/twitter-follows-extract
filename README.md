# twitter-follows-extract
Extracts Twitter followers/following lists to a CSV. 

Doesn't require any API shenanigans, just being logged in. 

Requires a bunch of scrolling, may only work in Chrome, super-scuffed. Based on some similarly scuffed code used for extracting Slack emoji from browser, where there's a similar dynamic-loading system for content. 

There are almost certainly better ways to do this, but they probably involve API setup, where this just requires you to open the page while logged in (and push a bunch of buttons).

⚠ **VERY likely to break. Feel free to mess with this as you need** ⚠ 

## How to use

- In Chrome, go to https://twitter.com/followers (or if this url changes, otherwise work out how to navigate to your Followers list)
- Switch tab between Followers and Following a couple of times - I have no idea why, but the first time you do this it reloads a huge amount of the page, and I didn't account for that - whereas once you've done it a few times, it only swaps out the parts we're watching for changes
- ⚠ ⚠ ⚠ PLEASE NOTE, YOU REALLY SHOULDN'T PASTE CODE INTO YOUR BROWSER THAT YOU DON'T UNDERSTAND. PROCEED AT YOUR OWN RISK. ⚠ ⚠ ⚠ 
  - I pinky-swear this just collects follower/following info entirely in your browser window, and gives you the ability to dump it into two CSVs, but you also shouldn't trust people on the internet
- Open the dev console (F12), paste the contents of script.js into the Console
- Now the fun part. Scroll up and down your Followers and Following tabs slowly. Don't reload the page, but you can switch between the Followers/Following tab freely. The script will gather up information as Twitter dynamically loads it. You may have to do this a couple of times - depending on your scroll speed and where you start scrolling, it may miss some the first time round.
- The script will report how many Followers/Following it's hoovered up. Once these numbers look right, type `saveCsvs()` into the console and hit enter
  
