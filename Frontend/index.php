<?php
    include_once './multi-link.live/header.php'
?>
<link href='./multi-link.live/styles/index.css' rel='stylesheet'/>

<section class='heroSection'>

<?php
  $heroH2Content = 'Welcome.';
  if (isset($_SESSION['user_first_name'])) $heroH2Content = 'Hello ' . $_SESSION['user_first_name'] . '.';
  echo '<h2>'.$heroH2Content."</h2>";
?>
  <h1>
    Imagine a new way to control midi.
  </h1>
  <a href='#anchor_Explore_Now'>
    Explore How
    <span class="material-icons md-48 md-dark">expand_more</span>
</a>

</section>

<section class = 'howItWorks' id="anchor_Explore_Now">
  
</section>

        

<?php
    include_once './multi-link.live/footer.php'
?>