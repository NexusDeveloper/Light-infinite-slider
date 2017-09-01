# Light infinite slider

```HTML
<div class="nexus-carousel partners"
     data-respondMouse="false"
     data-delay="1500"
     data-duration="1500"
     data-autoScroll="false"
     data-controls="true"
     data-nextSelector=".next"
     data-prevSelector=".prev"
>
  <div>
    <div class="bg-white">
      <div class="next"></div>
      <div class="prev"></div>
      <div class="viewport">
        <div class="wrapper">
          <div class="item">
            /* slide content */
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

```JS
$('.nexus-carousel').each(function(){
  new NexusCarousel(this);
});
```
